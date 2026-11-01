# JanAwaaz

JanAwaaz is a citizen-first public-service assistant MVP built with a React frontend and a Python FastAPI backend. It currently provides public portal reference links; it does not synchronize live government scheme data or submit applications to government portals.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI + Pydantic
- Database: Supabase/PostgreSQL schema template
- Browser automation: Playwright-ready structure

## Configure environment variables

Copy the example files before using real credentials:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
Copy-Item .\frontend\.env.example .\frontend\.env
```

Required backend values include:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY

Frontend values include:
- `VITE_API_URL` (leave empty for same-origin API routing; set the deployed backend origin when frontend and backend are hosted separately)

## Run the frontend

```powershell
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Run the backend

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Notes

- This project intentionally keeps integrations in a "not configured" state until real Supabase, OpenAI, and government source credentials are added.
- The backend now checks real environment variables and exposes integration status without fabricating live data.
- The AI endpoint returns a safe unavailable response instead of fake answers when the API key is missing.
- Government portal links are marked as reference-only. Scheme rules, eligibility, and required documents must be confirmed on each official portal; live data feeds and state-specific certificate portals are not connected.

## Production deployment

- `render.yaml` defines the FastAPI service; connect the repository in Render and provide any integration secrets through Render's environment settings.
- Deploy `frontend` as the Vercel project root. `frontend/vercel.json` configures SPA route fallback.
- Set Vercel's `VITE_API_URL` build variable to the deployed Render API origin, then redeploy the frontend.
- Never expose the Supabase service-role key or OpenAI key in frontend variables.
- The project is not publicly deployed by this repository. A hosting account/domain and production environment configuration are required before it can be published at a public URL.
- The current backend uses in-memory application/chat records and local file storage. These are demo-only and are not durable across host restarts; do not use this deployment for sensitive citizen data.
