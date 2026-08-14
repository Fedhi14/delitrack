# DeliTrack Deployment Guide

This project contains:
- Backend API: ASP.NET Core 8 (`src/DeliTrack.Api`)
- Frontend: React + Vite (`client`)

## 1) Quick local verification

### Backend
```powershell
dotnet restore DeliTrack.sln
dotnet run --project src/DeliTrack.Api/DeliTrack.Api.csproj
```
Backend should be reachable at `http://localhost:5100` (or the port shown in logs), with Swagger at `/swagger`.

### Frontend
```powershell
cd client
npm install
npm run dev
```
Open the Vite URL shown in terminal.

## 2) Production environment variables

### Frontend (`client`)
Set these in your hosting platform:
- `VITE_API_BASE_URL` = `https://<your-api-domain>/api`
- `VITE_SIGNALR_HUB_URL` = `https://<your-api-domain>/hubs/tracking` (optional)

See `client/.env.example`.

### Backend (`src/DeliTrack.Api`)
Set these in your hosting platform:
- `ASPNETCORE_ENVIRONMENT=Production`
- `ConnectionStrings__DefaultConnection=<your connection string>`
- `Jwt__Key=<strong secret key>`

Notes:
- If `ConnectionStrings__DefaultConnection` is not set, SQLite file `delitrack.db` is used.
- For managed cloud hosting, a managed SQL database is recommended over SQLite.

## 3) Deploy backend with Docker (recommended)

A root-level Dockerfile already exists for the API.

```powershell
# from repo root
docker build -t delitrack-api:latest .
docker run -d --name delitrack-api -p 8080:8080 ^
  -e ASPNETCORE_ENVIRONMENT=Production ^
  -e Jwt__Key="replace-with-strong-key" ^
  delitrack-api:latest
```

Health check:
- `http://localhost:8080/`
- `http://localhost:8080/swagger`

## 4) Deploy frontend (Vercel or Netlify)

### Vercel
1. Import `client` folder as the project root.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env var `VITE_API_BASE_URL` (and optional `VITE_SIGNALR_HUB_URL`).
5. Deploy.

### Netlify
1. Import `client` folder.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env var `VITE_API_BASE_URL` (and optional `VITE_SIGNALR_HUB_URL`).
5. Deploy.

## 5) Azure deployment (simple path)

### Backend to Azure App Service (Container)
1. Build and push Docker image to a registry (ACR or Docker Hub).
2. Create an App Service (Linux, container-based).
3. Configure container image.
4. Add app settings:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - `ConnectionStrings__DefaultConnection=...`
   - `Jwt__Key=...`
5. Enable WebSockets in App Service (recommended for SignalR).

### Frontend to Azure Static Web Apps (or Vercel/Netlify)
- Deploy the `client` app and set `VITE_API_BASE_URL` to your backend URL.

## 6) Post-deploy checklist

- Backend `/swagger` loads successfully.
- Login/Register works from frontend.
- Creating and assigning orders works.
- SignalR tracking updates arrive in real time.
- CORS policy is acceptable for your security requirements.

## 7) Common issues

- 401 Unauthorized: Verify JWT key consistency and token expiration.
- Frontend cannot reach API: Check `VITE_API_BASE_URL` and HTTPS URL.
- SignalR not connecting: Verify `VITE_SIGNALR_HUB_URL`, WebSockets support, and hub route `/hubs/tracking`.
- Database reset behavior: The app currently uses `EnsureCreated/EnsureDeleted` fallback logic in startup; use EF migrations for production-hardening.
