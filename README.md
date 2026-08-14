# DeliTrack

## Host backend and frontend

### 1) Host the backend (`src/DeliTrack.Api`)

This repo already includes a backend `Dockerfile`, so you can deploy it directly on Docker-based platforms (Render, Railway, Fly.io, etc.).

1. Create a new Web Service from this repository.
2. Set the service to use the repository `Dockerfile`.
3. Expose port `8080` (the container listens on `8080`).
4. Deploy and copy your backend URL (example: `https://your-api.onrender.com`).

You can also run it manually:

```bash
dotnet publish src/DeliTrack.Api/DeliTrack.Api.csproj -c Release -o out
dotnet out/DeliTrack.Api.dll
```

---

### 2) Host the frontend (`client`)

The frontend is a Vite React app and includes `client/vercel.json`.

1. Create a new Vercel project from this repository.
2. Set the root directory to `client`.
3. Add environment variable:
   - `VITE_API_BASE_URL=https://your-backend-domain/api`
4. Deploy.

Build locally if needed:

```bash
npm --prefix client install
npm --prefix client run build
```

---

### 3) Important after deploy

- Update `client/src/services/signalr.ts` to point to your deployed backend hub URL instead of localhost:
  - from `http://localhost:5000/hubs/tracking`
  - to `https://your-backend-domain/hubs/tracking`
- Rebuild/redeploy the frontend after this change.
