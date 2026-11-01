from __future__ import annotations

from typing import Any, Dict, Optional

from app.config import settings

try:
    from supabase import Client, create_client
except ImportError:  # pragma: no cover
    Client = Any  # type: ignore[misc,assignment]
    create_client = None  # type: ignore[assignment]


def get_supabase_client() -> Optional[Client]:
    if not settings.supabase_url or not settings.supabase_anon_key:
        return None
    if create_client is None:
        return None
    try:
        return create_client(settings.supabase_url, settings.supabase_anon_key)
    except Exception:
        return None


def get_service_role_client() -> Optional[Client]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None
    if create_client is None:
        return None
    try:
        return create_client(settings.supabase_url, settings.supabase_service_role_key)
    except Exception:
        return None


def get_supabase_status() -> Dict[str, Any]:
    configured = bool(settings.supabase_url and settings.supabase_anon_key)
    return {
        "provider": "Supabase",
        "status": "connected" if configured else "not_configured",
        "configured": configured,
        "url": settings.supabase_url or None,
        "message": (
            "Supabase is configured and ready for profile and document storage."
            if configured
            else "Supabase credentials are not configured. Add the project URL and anon key to enable storage and auth."
        ),
    }


def sign_up_with_supabase(email: str, password: str, full_name: str, extra_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    client = get_service_role_client()
    if client is None:
        return {
            "status": "not_configured",
            "message": "Supabase service-role credentials are missing. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable auth and profile persistence.",
        }

    try:
        auth_response = client.auth.sign_up(
            {
                "email": email,
                "password": password,
                "options": {"data": {"full_name": full_name, **(extra_profile or {})}},
            }
        )
        user = getattr(auth_response, "user", None)
        user_id = getattr(user, "id", None)
        if user_id:
            profile_payload = {
                "user_id": user_id,
                "full_name": full_name,
                "email": email,
                **(extra_profile or {}),
            }
            client.table("profiles").upsert(profile_payload, on_conflict="user_id").execute()
        return {
            "status": "ok",
            "user_id": user_id,
            "message": "Account created successfully. Check email for confirmation if email verification is enabled.",
            "profile": profile_payload if user_id else None,
        }
    except Exception as exc:  # pragma: no cover - external service failure
        return {
            "status": "error",
            "message": f"Supabase sign-up failed: {exc}",
        }


def sign_in_with_supabase(email: str, password: str) -> Dict[str, Any]:
    client = get_supabase_client()
    if client is None:
        return {
            "status": "not_configured",
            "message": "Supabase anon credentials are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY to enable sign-in.",
        }

    try:
        auth_response = client.auth.sign_in_with_password({"email": email, "password": password})
        user = getattr(auth_response, "user", None)
        session = getattr(auth_response, "session", None)
        if not user:
            return {"status": "error", "message": "Invalid email or password."}
        return {
            "status": "ok",
            "user_id": getattr(user, "id", None),
            "email": getattr(user, "email", email),
            "session": getattr(session, "access_token", None),
            "message": "Signed in successfully.",
        }
    except Exception as exc:  # pragma: no cover - external service failure
        return {
            "status": "error",
            "message": f"Supabase sign-in failed: {exc}",
        }


def get_profile_record(user_id: str) -> Dict[str, Any]:
    client = get_service_role_client()
    if client is None:
        return {
            "status": "not_configured",
            "message": "Supabase is not configured. Add credentials to load the real citizen profile.",
        }

    try:
        response = client.table("profiles").select("*").eq("user_id", user_id).limit(1).execute()
        row = response.data[0] if response.data else None
        return {
            "status": "ok",
            "profile": row,
        }
    except Exception as exc:  # pragma: no cover - external service failure
        return {
            "status": "error",
            "message": f"Could not load profile: {exc}",
        }


def upsert_profile_record(user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    client = get_service_role_client()
    if client is None:
        return {
            "status": "not_configured",
            "message": "Supabase is not configured. Add credentials to persist profile data.",
        }

    try:
        profile_payload = {**payload, "user_id": user_id}
        response = client.table("profiles").upsert(profile_payload, on_conflict="user_id").execute()
        return {
            "status": "ok",
            "profile": response.data[0] if response.data else profile_payload,
            "message": "Profile saved successfully.",
        }
    except Exception as exc:  # pragma: no cover - external service failure
        return {
            "status": "error",
            "message": f"Profile persistence failed: {exc}",
        }
