from __future__ import annotations

from typing import Any, Dict, Optional

from app.config import settings

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None  # type: ignore[assignment]


def get_openai_client() -> Optional[Any]:
    if not settings.openai_api_key:
        return None
    if OpenAI is None:
        return None
    try:
        return OpenAI(api_key=settings.openai_api_key)
    except Exception:
        return None


def get_openai_status() -> Dict[str, Any]:
    configured = bool(settings.openai_api_key)
    return {
        "provider": "OpenAI",
        "status": "connected" if configured else "not_configured",
        "configured": configured,
        "message": (
            "OpenAI is configured and the assistant can answer service and eligibility questions."
            if configured
            else "OpenAI credentials are not configured. Add an API key to enable live AI assistance."
        ),
    }


def generate_chat_reply(message: str, profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    client = get_openai_client()
    if client is None:
        return {
            "role": "assistant",
            "message": "OpenAI integration is not configured. Add the API key in the backend environment to enable live AI responses.",
            "citations": [],
            "status": "not_configured",
        }

    try:
        profile_context = ""
        if profile:
            profile_context = (
                "Use this profile context only for eligibility and document guidance: "
                f"Name: {profile.get('full_name', 'Not provided')}; "
                f"State: {profile.get('state', 'Not provided')}; "
                f"District: {profile.get('district', 'Not provided')}; "
                f"Education: {profile.get('educational_qualification', 'Not provided')}."
            )

        response = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are JanAwaaz, an AI assistant for citizen public services. "
                        "Provide helpful guidance only from verified government information or clearly label it as general guidance when no official source is available. "
                        "Never invent government schemes, eligibility rules, deadlines, or tracking numbers. "
                        "When a service or source is not configured, say that clearly and offer the next safe step."
                    ),
                },
                {
                    "role": "user",
                    "content": f"{profile_context}\n\nCitizen message: {message}",
                },
            ],
            temperature=0.3,
        )
        answer = getattr(response, "output_text", None) or "I could not generate a response right now."
        return {
            "role": "assistant",
            "message": answer,
            "citations": [],
            "status": "ok",
        }
    except Exception as exc:  # pragma: no cover
        return {
            "role": "assistant",
            "message": f"The AI service could not respond because of an integration error: {exc}",
            "citations": [],
            "status": "error",
        }
