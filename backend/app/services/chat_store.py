from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Dict, List, Optional


class ChatStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._conversations: Dict[str, Dict[str, Any]] = {}

    def create_conversation(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        conversation_id = f"conv-{len(self._conversations) + 1}"
        conversation = {
            "id": conversation_id,
            "user_id": user_id,
            "title": "New conversation",
            "created_at": now,
            "updated_at": now,
            "messages": [],
        }
        with self._lock:
            self._conversations[conversation_id] = conversation
        return deepcopy(conversation)

    def get_conversations(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [deepcopy(item) for item in self._conversations.values()]

    def get_conversation(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            item = self._conversations.get(conversation_id)
            return deepcopy(item) if item else None

    def append_message(self, conversation_id: str, role: str, content: str, citations: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        with self._lock:
            conversation = self._conversations.get(conversation_id)
            if conversation is None:
                raise KeyError(f"Conversation {conversation_id} not found")
            message = {
                "id": f"msg-{len(conversation['messages']) + 1}",
                "role": role,
                "content": content,
                "citations": citations or [],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            conversation["messages"].append(message)
            conversation["updated_at"] = message["created_at"]
            if len(conversation["messages"]) == 1:
                conversation["title"] = content[:60] or "New conversation"
            return deepcopy(message)


chat_store = ChatStore()
