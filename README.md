# 🚚 DeliTrack — Delivery & Tracking Platform

A full-stack delivery management and real-time GPS tracking platform built for Ethiopian logistics, featuring role-based dashboards, KYC driver verification, and live order tracking.

**🌐 Live Demo:** [https://delitrack-pebu.vercel.app/login](https://delitrack-pebu.vercel.app/login)  
**⚙️ API Backend:** [https://delitrack-app.onrender.com](https://delitrack-app.onrender.com)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | ASP.NET Core 8 Web API (C#) |
| Database | SQLite + Entity Framework Core |
| Real-time | SignalR (live GPS tracking) |
| Auth | JWT Bearer Tokens |
| Maps | Leaflet.js |
| Deployment | Vercel (frontend) + Render (backend) |

---

## ✨ Features

- 📦 **Order Management** — Create, assign, and track delivery orders end-to-end
- 🗺 **Live GPS Tracking** — Real-time driver location updates via SignalR
- 🛡 **Driver KYC Verification** — Fayda ID (FIN/FAN), front/back photo & selfie upload
- 👤 **Role-Based Dashboards** — Separate views for Admin, Dispatcher, Driver, and Customer
- 💰 **Earnings & Payouts** — Driver earnings tracking with bank withdrawal support (CBE, Telebirr, etc.)
- 📊 **Admin Analytics** — Platform-wide stats, order history, and revenue tracking
- 🔔 **Notifications** — In-app alerts for order status changes
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop

---

## 👥 Roles & Access

| Role | Description |
|------|-------------|
| **Admin** | Full platform control — manage users, drivers, orders, KYC approvals |
| **Dispatcher** | Assign orders to drivers, review KYC, monitor deliveries |
| **Driver** | Accept orders, update delivery status, submit KYC, track earnings |
| **Customer** | Place orders, track deliveries in real-time, view order history |

---

## 🔐 Demo Accounts

> Password for all accounts: **`password123`**

| Role | Email |
|------|-------|
| Admin | `admin@delitrack.com` |
| Dispatcher | `dispatcher@delitrack.com` |
| Driver | `abebe@delitrack.com` |
| Customer | `yad@gmail.com` |

> 💡 You can also **create your own account** as a **Customer** or **Driver** from the [Register page](https://delitrack-pebu.vercel.app/register).  
> Drivers must complete **Fayda KYC verification** after registering before they can receive orders.

---

## 🔄 How It Works

```
Customer places order
       ↓
Dispatcher assigns order to a verified Driver
       ↓
Driver picks up package & updates status in real-time
       ↓
Customer tracks live GPS location on map
       ↓
Driver marks order as Delivered
       ↓
Earnings credited to Driver's account
```

---

## 🚀 Running Locally

### Backend
```bash
cd src/DeliTrack.Api
dotnet run --urls=http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev
```

> The frontend auto-connects to `http://localhost:5000/api` when running locally.

---

## 📁 Project Structure

```
delitrack/
├── src/
│   └── DeliTrack.Api/          # ASP.NET Core 8 Web API
│       ├── Controllers/         # API endpoints
│       ├── Services/            # Business logic
│       ├── Models/              # Entity models
│       ├── Data/                # EF Core DbContext & seed data
│       └── Hubs/                # SignalR real-time hub
├── client/                      # React + TypeScript frontend
│   └── src/
│       ├── pages/               # Role dashboards & pages
│       ├── components/          # Reusable UI components
│       └── services/            # API & SignalR clients
└── Dockerfile                   # Docker build for Render
```

---

## 📄 License

MIT — Built for demo and educational purposes.
