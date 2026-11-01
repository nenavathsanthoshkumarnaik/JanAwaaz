# JanAwaaz frontend

The React + TypeScript frontend is built with Vite.

```powershell
npm install
npm run dev
npm run build
```

For local development, Vite proxies `/api` requests to the FastAPI backend on `http://127.0.0.1:8001`. Set `VITE_API_URL` to the deployed API origin when the frontend and backend are hosted separately. See the [project README](../README.md) for deployment notes and integration limitations.
