from typing import Optional

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    user_id: Optional[str] = Field(default=None, max_length=100)
    full_name: Optional[str] = Field(default=None, max_length=200)
    date_of_birth: Optional[str] = None
    email: Optional[str] = Field(default=None, max_length=200)
    mobile_number: Optional[str] = Field(default=None, max_length=20)
    state: Optional[str] = Field(default=None, max_length=100)
    district: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=500)
    pin_code: Optional[str] = Field(default=None, max_length=20)
    educational_qualification: Optional[str] = Field(default=None, max_length=200)


class AuthSignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=8, max_length=128)


class AuthLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=8, max_length=128)


class ServiceSummary(BaseModel):
    id: str
    service_name: str
    category: str
    department: str
    source_status: str = "not_configured"


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
