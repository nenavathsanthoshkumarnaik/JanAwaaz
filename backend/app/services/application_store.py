from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, List, Optional


class ApplicationStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._applications: Dict[str, Dict[str, Any]] = {}

    def create_application(self, service_id: str, service_name: str, user_id: str = 'demo-user') -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        app_id = f"app-{len(self._applications) + 1}"
        application = {
            'id': app_id,
            'user_id': user_id,
            'service_id': service_id,
            'service_name': service_name,
            'status': 'draft',
            'tracking_reference': f'JAN-{app_id.upper()}',
            'created_at': now,
            'updated_at': now,
        }
        with self._lock:
            self._applications[app_id] = application
        return deepcopy(application)

    def list_applications(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [deepcopy(item) for item in self._applications.values()]


application_store = ApplicationStore()
