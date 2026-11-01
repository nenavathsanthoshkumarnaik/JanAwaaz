export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type IntegrationStatus = {
  provider: string;
  status: string;
  configured?: boolean;
  message?: string;
};

export async function getIntegrationStatus(): Promise<{ integrations: IntegrationStatus[] }> {
  return fetchJson<{ integrations: IntegrationStatus[] }>('/api/integrations/status');
}

export async function signUpWithSupabase(payload: { full_name: string; email: string; password: string }) {
  return fetchJson<{ status: string; message: string; user_id?: string }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginWithSupabase(payload: { email: string; password: string }) {
  return fetchJson<{ status: string; message: string; user_id?: string; email?: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfile(userId: string = 'demo-user') {
  return fetchJson<{ profile?: Record<string, unknown>; integration_status?: string; status?: string; message?: string }>(`/api/profile?user_id=${encodeURIComponent(userId)}`);
}

export async function saveProfile(payload: Record<string, unknown>) {
  return fetchJson<{ status: string; message: string; profile?: Record<string, unknown> }>('/api/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type ServiceItem = {
  id: string;
  service_name: string;
  category: string;
  department: string;
  source_status: string;
  portal: string;
  official_source_name?: string;
  source_url?: string;
  description?: string;
  last_verified_at?: string;
};

export type ServiceRequirements = {
  service_id: string;
  service_name: string;
  required_documents: string[];
  eligibility: string;
  source_status: string;
  official_source_name?: string;
  source_url?: string;
  description?: string;
  last_verified_at?: string;
};

export async function getServices(): Promise<{ items: ServiceItem[]; count: number; source_status: string }> {
  return fetchJson<{ items: ServiceItem[]; count: number; source_status: string }>('/api/services');
}

export async function getServiceRequirements(serviceId: string): Promise<ServiceRequirements> {
  return fetchJson<ServiceRequirements>(`/api/services/${encodeURIComponent(serviceId)}/requirements`);
}

export async function getConversationList(): Promise<{ items: Array<{ id: string; title: string; messages: Array<Record<string, unknown>> }>; count: number }> {
  return fetchJson<{ items: Array<{ id: string; title: string; messages: Array<Record<string, unknown>> }>; count: number }>('/api/chat/conversations');
}

export async function createConversation(): Promise<{ conversation_id: string; status: string; message: string }> {
  return fetchJson<{ conversation_id: string; status: string; message: string }>('/api/chat/conversations', {
    method: 'POST',
  });
}

export async function sendChatMessage(conversationId: string, message: string) {
  return fetchJson<{ conversation_id: string; message: string; user_message: string; citations: Array<Record<string, unknown>>; status: string }>('/api/chat/conversations/' + conversationId + '/messages', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
