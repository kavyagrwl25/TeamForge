# 🚀 TeamForge

**TeamForge** is a full-stack developer collaboration platform designed to streamline how developers discover projects, connect with collaborators, and build together in a structured and scalable way.

---

## 🧩 Overview

In today’s ecosystem, developers are highly motivated to build, learn, and collaborate. However, the process of finding the right project or the right team is often fragmented and inefficient.

TeamForge addresses this gap by providing a **centralized system for project discovery and collaboration management**, enabling developers to move from idea → team → execution in a more organized way.

---

## ❗ Problem Statement

Modern developer collaboration suffers from a lack of structure and visibility.

### Key Challenges:

* **Fragmented Discovery**

  * Project opportunities are scattered across multiple platforms (WhatsApp, Discord, LinkedIn, etc.)
  * No centralized place to explore meaningful projects

* **Lack of Structured Profiles**

  * Developers cannot effectively showcase skills, interests, and experience in a collaboration context
  * Project owners struggle to evaluate potential contributors

* **Inefficient Team Formation**

  * No standard workflow for:

    * Expressing interest in a project
    * Reviewing applicants
    * Accepting/rejecting requests

* **Poor Scalability**

  * Informal systems do not scale as projects or communities grow
  * Leads to missed opportunities and weak collaboration

---

## 💡 Solution

TeamForge introduces a **structured collaboration layer** for developers.

### Core Ideas:

* **Profile-Centric Identity**

  * Developers maintain structured profiles highlighting skills and experience

* **Project-Based Discovery**

  * Project owners define ideas along with required roles and technologies

* **Request-Based Collaboration Workflow**

  * Developers apply to projects via structured requests
  * Owners review and manage incoming requests

* **Systematic Team Formation**

  * Replaces informal communication with a scalable backend-driven workflow

---

## 🏗️ System Architecture

TeamForge is built as a modular full-stack application:

* **Frontend:** React (Vite) + Tailwind CSS
* **Backend:** Node.js + Express.js
* **Database:** MongoDB
* **Authentication:** JWT with Access & Refresh Tokens (HTTP-only cookies)

### Communication Flow:

Frontend → REST API → Backend → Database

---

## ⚙️ Core Features

### 🔐 Authentication & Session Management

* Secure user registration and login
* JWT-based authentication
* Access & refresh token mechanism
* Refresh token rotation
* HTTP-only cookie-based session handling

### 👤 User Management

* Create and manage developer profiles
* Update profile information
* Change password securely
* Delete account

### 📁 Project Management

* Create, update, and delete projects
* Define required roles and tech stack
* View own projects
* Explore projects created by others

### 🤝 Collaboration Requests

* Send request to join a project
* Prevent duplicate and invalid requests
* View incoming requests (project owner)
* View sent requests (applicant)
* Delete requests
* Request status workflow (in progress)

### 🧱 Backend Design Principles

* Versioned REST API (`/api/v1`)
* Middleware-driven route protection
* Centralized error handling
* Async controller abstraction
* Input validation layer
* Clean and modular architecture

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Security

* JWT
* bcrypt
* HTTP-only cookies
* CORS

---

## 📁 Project Structure

```
TeamForge/
├── backend/
│   ├── src/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🔄 Authentication Flow

* Access Token → Used for protected API requests
* Refresh Token → Used to generate new access tokens
* Tokens stored securely in HTTP-only cookies
* Automatic session renewal via refresh endpoint

---

## ▶️ Getting Started

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 📊 Development Status

### ✅ Completed

* Backend architecture and API design
* Authentication system (JWT + refresh flow)
* User management
* Project CRUD operations
* Request system (core functionality)

### 🚧 In Progress

* Request accept/reject workflow
* Frontend integration
* Route protection on UI

### 🔮 Planned

* Pagination, filtering, and search
* Real-time notifications
* Chat system (WebSockets)
* AI-assisted features (chatbot for guidance)
* Deployment and DevOps setup
* API documentation

---

## 🎯 Why TeamForge?

TeamForge is designed as a **product-oriented project**, not just a CRUD application.

It demonstrates:

* Real-world backend architecture
* Secure authentication strategies
* Scalable API design
* Structured collaboration systems
* Full-stack integration mindset

---

## 👨‍💻 Author

**Kavya Agrawal**
MERN Stack Developer | Backend-Focused Engineer

---

## ⭐ Support

If you found this project useful or interesting, consider giving it a star ⭐
