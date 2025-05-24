# HEC Électricité – Backend API

This is the backend service for the HEC Électricité web application, designed to manage electrical project workflows, client interactions, appointment scheduling, and cost estimations. The backend follows RESTful principles and was built using **Node.js** with **Express.js**.

---

## 📌 Project Overview

HEC Électricité is a web platform aimed at streamlining project management for an electrical engineering firm. The backend exposes secure APIs to support:

- Project creation, updates, and tracking
- Client access to ongoing and historical projects
- Cost simulation tools
- Appointment scheduling with engineers
- Admin dashboard for performance tracking

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions or other pipeline (optional)
- **Hosting:** AWS / Vercel

---

## 🔐 Key Features

### ✅ Project Management
- CRUD operations for projects
- Status updates (e.g., *En cours*, *Réalisé*)
- Real-time notifications for clients

### 👤 Client Interface
- View active and past projects
- Submit update requests for project details

### 💸 Cost Estimation
- Interactive simulation tool
- Store and retrieve past estimates

### 📅 Appointment Booking
- Online reservation system for consultations
- Email or in-app notifications for reminders

### 🛠 Admin Dashboard
- Manage users and permissions
- Visualize project KPIs and statistics

---

## 🔧 Installation

```bash
git clone https://github.com/BenMabroukAya/hecbackend.git
cd hecbackend
npm install
🧪 Run Tests
bash
Copy
Edit
npm test
▶️ Start Server (Development)
bash
Copy
Edit
npm run dev
🛡️ Security
All sensitive data encrypted

JWT-based authentication with potential OAuth extension

Compliant with data protection standards

🧩 API Endpoints
Basic endpoints include:

POST /api/auth/login – Authentication

GET /api/projects – List all projects

POST /api/projects – Create new project

PUT /api/projects/:id – Update project

GET /api/clients/:id/projects – View client-specific projects

POST /api/appointments – Schedule a meeting

GET /api/simulations – View past cost simulations


🌀 Scrum-Based Development Sprints
Sprint 1 – Setup environment & architecture

Sprint 2 – Build backend & RESTful APIs

Sprint 4 – Write unit/integration tests

Sprint 5 – Deployment & feedback

📂 Project Structure
arduino
Copy
Edit
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── tests/
└── config/
🧑‍💻 Contributors
[BEN MABROUK AYA] – Full-Stack Developer

📄 License
MIT License

📬 Contact
For any questions or feedback, please reach out to: [aya.benmabrouk@isimg.tn]
