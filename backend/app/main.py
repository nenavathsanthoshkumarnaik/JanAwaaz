from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import AuthLoginRequest, AuthSignupRequest, ChatMessageRequest, ProfileUpdate, ServiceSummary
from app.services.ai_service import generate_chat_reply, get_openai_status
from app.services.application_store import application_store
from app.services.chat_store import chat_store
from app.services.document_store import document_store
from app.services.service_catalog import get_catalog
from app.services.supabase_service import get_profile_record, get_supabase_status, sign_in_with_supabase, sign_up_with_supabase, upsert_profile_record

app = FastAPI(
    title="JanAwaaz API",
    version="0.1.0",
    description="Operational API shell for JanAwaaz citizen service workflows.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
    }


@app.get("/api/profile")
async def get_profile(user_id: str | None = Query(default=None)) -> Dict[str, Any]:
    selected_user_id = user_id or "demo-user"
    if settings.supabase_url and settings.supabase_service_role_key:
        record = get_profile_record(selected_user_id)
        if record.get("status") == "ok":
            return {
                "profile": record.get("profile") or {
                    "full_name": "Citizen",
                    "email": None,
                    "status": "profile_incomplete",
                },
                "integration_status": "connected",
            }
        return record

    return {
        "profile": {
            "full_name": "Citizen",
            "email": None,
            "mobile_number": None,
            "state": None,
            "district": None,
            "status": "profile_incomplete",
        },
        "integration_status": "not_configured",
    }


@app.post("/api/auth/signup")
async def signup(payload: AuthSignupRequest) -> Dict[str, Any]:
    return sign_up_with_supabase(payload.email, payload.password, payload.full_name)


@app.post("/api/auth/login")
async def login(payload: AuthLoginRequest) -> Dict[str, Any]:
    return sign_in_with_supabase(payload.email, payload.password)


@app.post("/api/profile")
async def create_profile(payload: ProfileUpdate) -> Dict[str, Any]:
    user_id = payload.user_id or "demo-user"
    if settings.supabase_url and settings.supabase_service_role_key:
        result = upsert_profile_record(user_id, payload.model_dump(exclude_none=True, exclude={"user_id"}))
        return result
    return {
        "message": "Profile update accepted for local demo mode.",
        "received": payload.model_dump(exclude_none=True),
        "status": "saved_locally",
    }


@app.put("/api/profile")
async def update_profile(payload: ProfileUpdate) -> Dict[str, Any]:
    user_id = payload.user_id or "demo-user"
    if settings.supabase_url and settings.supabase_service_role_key:
        result = upsert_profile_record(user_id, payload.model_dump(exclude_none=True, exclude={"user_id"}))
        return result
    return {
        "message": "Profile updated successfully.",
        "received": payload.model_dump(exclude_none=True),
        "status": "updated",
    }


@app.get("/api/services")
async def list_services() -> Dict[str, Any]:
    services = get_catalog()
    return {
        "items": [
            {
                "id": item["id"],
                "service_name": item["service_name"],
                "category": item["category"],
                "department": item["department"],
                "source_status": item["source_status"],
                "portal": item["portal"],
                "official_source_name": item.get("official_source_name"),
                "source_url": item.get("source_url"),
                "description": item.get("description"),
                "last_verified_at": item.get("last_verified_at"),
            }
            for item in services
        ],
        "count": len(services),
        "source_status": "reference_only",
    }


@app.get("/api/services/{service_id}")
async def get_service(service_id: str) -> Dict[str, Any]:
    catalog = get_catalog()
    item = next((entry for entry in catalog if entry["id"] == service_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return item


@app.get("/api/services/{service_id}/requirements")
async def get_service_requirements(service_id: str) -> Dict[str, Any]:
    catalog = get_catalog()
    item = next((entry for entry in catalog if entry["id"] == service_id), None)
    if item is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return {
        "service_id": service_id,
        "service_name": item["service_name"],
        "required_documents": item["required_documents"],
        "eligibility": item["eligibility"],
        "source_status": item["source_status"],
        "official_source_name": item.get("official_source_name"),
        "source_url": item.get("source_url"),
        "description": item.get("description"),
        "last_verified_at": item.get("last_verified_at"),
    }


@app.get("/api/documents")
async def list_documents() -> Dict[str, Any]:
    documents = document_store.list_documents()
    return {
        "items": documents,
        "count": len(documents),
        "status": "ok",
    }


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("identity"),
    user_id: str = Form("demo-user"),
    service_id: str | None = Form(default=None),
) -> Dict[str, Any]:
    if settings.app_env.lower() == "production":
        raise HTTPException(
            status_code=503,
            detail="Document uploads are disabled until secure cloud storage and authentication are configured.",
        )
    if not file.filename:
        raise HTTPException(status_code=400, detail="Document filename is required")
    if Path(file.filename).suffix.lower() not in {".pdf", ".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=415, detail="Only PDF, PNG, and JPEG documents are supported")

    content = await file.read(10 * 1024 * 1024 + 1)
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Document size must be 10 MB or less")
    saved = document_store.save_document(
        file_name=file.filename,
        content=content,
        document_type=document_type,
        user_id=user_id,
        service_id=service_id,
    )
    return {
        "status": "uploaded",
        "message": "Document uploaded successfully.",
        "document": saved,
    }


@app.get("/api/applications")
async def list_applications() -> Dict[str, Any]:
    apps = application_store.list_applications()
    return {
        "items": apps,
        "count": len(apps),
        "message": "Applications loaded successfully." if apps else "No applications exist yet. Create a new service request to begin.",
    }


@app.post("/api/applications")
async def create_application(payload: Dict[str, Any]) -> Dict[str, Any]:
    service_id = str(payload.get("service_id") or "").strip()
    service_name = str(payload.get("service_name") or "").strip()
    user_id = str(payload.get("user_id") or "demo-user").strip()

    if not service_id or not service_name:
        raise HTTPException(status_code=400, detail="service_id and service_name are required")

    application = application_store.create_application(service_id, service_name, user_id)
    return {
        "status": "draft",
        "message": "Application draft created successfully.",
        "application": application,
    }


@app.get("/api/integrations/status")
async def integrations_status() -> Dict[str, Any]:
    return {
        "integrations": [
            get_supabase_status(),
            get_openai_status(),
            {
                "provider": "Government Data Sources",
                "status": "reference_only",
                "configured": True,
                "message": "The catalog contains links to public government portals only; it does not fetch or synchronize live scheme data. State-specific certificate sources are not configured.",
            },
            {"provider": "Playwright", "status": "not_configured", "configured": False, "message": "Playwright automation is not configured. Add an authorized portal and browser session to enable live execution."},
        ]
    }


@app.get("/api/chat/conversations")
async def list_conversations() -> Dict[str, Any]:
    return {
        "items": chat_store.get_conversations(),
        "count": len(chat_store.get_conversations()),
    }


@app.post("/api/chat/conversations")
async def create_conversation() -> Dict[str, Any]:
    conversation = chat_store.create_conversation(user_id="demo-user")
    return {
        "conversation_id": conversation["id"],
        "status": "created",
        "message": "Chat conversation created. The AI integration will respond when OpenAI credentials are added.",
    }


@app.get("/api/chat/conversations/{conversation_id}")
async def get_conversation(conversation_id: str) -> Dict[str, Any]:
    conversation = chat_store.get_conversation(conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.post("/api/chat/conversations/{conversation_id}/messages")
async def add_chat_message(conversation_id: str, payload: ChatMessageRequest) -> Dict[str, Any]:
    if conversation_id not in {item["id"] for item in chat_store.get_conversations()}:
        raise HTTPException(status_code=404, detail="Conversation not found")

    chat_store.append_message(conversation_id, "user", payload.message)
    reply = generate_chat_reply(payload.message, profile={
        "state": None,
        "district": None,
    })
    assistant_message = chat_store.append_message(
        conversation_id,
        reply["role"],
        reply["message"],
        citations=reply.get("citations", []),
    )
    return {
        "conversation_id": conversation_id,
        "role": assistant_message["role"],
        "message": assistant_message["content"],
        "user_message": payload.message,
        "citations": assistant_message.get("citations", []),
        "status": reply.get("status", "ok"),
    }


@app.post("/api/chat/assistant/action")
async def chat_action(payload: Dict[str, Any]) -> Dict[str, Any]:
    message = str(payload.get("message") or "")
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    reply = generate_chat_reply(message)
    return {
        "status": reply.get("status", "ok"),
        "reply": reply["message"],
        "citations": reply.get("citations", []),
    }


@app.post("/api/agent/start")
async def start_agent() -> Dict[str, Any]:
    return {
        "status": "not_configured",
        "message": "Browser automation is disabled until a verified portal and Playwright configuration are added.",
    }


@app.get("/api/agent/status/{application_id}")
async def agent_status(application_id: str) -> Dict[str, Any]:
    return {
        "application_id": application_id,
        "status": "not_configured",
        "execution_stage": "awaiting_configuration",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
