from __future__ import annotations

import re
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional


class DocumentStore:
    def __init__(self, storage_dir: str | None = None) -> None:
        base_dir = Path(storage_dir) if storage_dir else Path(__file__).resolve().parents[2] / 'uploads'
        self.storage_dir = base_dir
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._lock = Lock()
        self._documents: Dict[str, Dict[str, Any]] = {}

    def save_document(
        self,
        file_name: str,
        content: bytes,
        document_type: str,
        user_id: str = 'demo-user',
        service_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        base_name = Path(file_name.replace('\\', '/')).name
        safe_name = re.sub(r'[^A-Za-z0-9._ -]', '_', base_name).strip(' .') or 'document'
        unique_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}-{safe_name}"
        storage_path = self.storage_dir / unique_name
        storage_path.write_bytes(content)

        document = {
            'id': f"doc-{len(self._documents) + 1}",
            'user_id': user_id,
            'service_id': service_id,
            'file_name': safe_name,
            'document_type': document_type,
            'storage_path': str(storage_path),
            'size_bytes': len(content),
            'status': 'uploaded',
            'uploaded_at': now,
        }
        with self._lock:
            self._documents[document['id']] = document
        return deepcopy(document)

    def list_documents(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [deepcopy(item) for item in self._documents.values()]


document_store = DocumentStore()
