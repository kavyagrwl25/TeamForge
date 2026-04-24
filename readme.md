# TeamForge

A backend-first developer collaboration platform that helps developers discover projects, connect with like-minded builders, and collaborate in a more structured way.

TeamForge is designed to solve a simple but common problem: talented people often want to build together, but there is no clean system to present project ideas, find relevant teammates, and manage collaboration requests. This project aims to provide that foundation through a secure, scalable, and well-structured REST API.

---

## Overview

TeamForge allows users to:

- create and manage developer profiles
- showcase skills and social links
- build a collaboration-ready backend identity
- create and manage project opportunities
- explore projects posted by others
- send requests to join projects
- support owner-driven team formation workflows

This repository currently focuses on the backend architecture and API layer, with authentication, user management, route organization, middleware, and foundational modules already implemented.

---

## Problem Statement

Developers often want to work on meaningful projects, contribute to exciting ideas, and connect with people who have complementary skills. However, in most cases, this process is unstructured.

Project collaboration usually happens through scattered sources such as group chats, communities, social media posts, or personal networks. Because of this:

- project ideas are not presented in an organized way
- developers struggle to find relevant opportunities
- project owners struggle to find the right collaborators
- there is no clear workflow for expressing interest, reviewing requests, and building teams
- collaboration discovery becomes inefficient and inconsistent

This creates friction in something that should be simple: finding the right people to build with.

---

## Solution

TeamForge is designed to solve this problem by providing a structured developer collaboration platform.

It offers a backend system where:

- users can create developer-focused profiles
- project owners can post project ideas and define required roles or skills
- other developers can explore available opportunities
- interested users can send requests to join projects
- collaboration can begin through a more organized and scalable workflow

By turning informal project discovery into a dedicated platform experience, TeamForge aims to make collaboration more accessible, transparent, and efficient for developers.

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT (Access + Refresh Tokens)
* HTTP-only Cookies
* bcrypt
* CORS

### Testing

* Vitest
* Supertest

### Frontend (In Progress)

* React (Vite)
* Tailwind CSS
* Axios

---

## ⚙️ Features

### 🔐 Authentication

* User Registration
* User Login
* Secure Logout
* JWT-based Authentication
* Access + Refresh Token Flow
* Refresh Token Rotation
* Cookie-based Session Handling

### 👤 User Management

* Get Current User
* Update Profile
* Change Password
* Delete Account

### 📁 Project Module (Completed ✅)

* Create Project
* Update Project
* Delete Project
* Get Project by ID
* Get My Projects
* Explore Projects

### 🤝 Request Module (Completed ✅)

* Send Request to Join Project
* Prevent duplicate requests
* Prevent self-requesting
* View Requests for My Project
* View My Sent Requests
* Delete Request
* Request status update (in progress)

### 🧱 API Foundation

* Versioned REST API (`/api/v1`)
* Protected Routes Middleware
* Centralized Error Handling
* Async Handler Wrapper
* Standardized API Responses
* Custom Validators

---

## 🧠 Architecture Highlights

### Token-Based Authentication

* Short-lived access tokens
* Long-lived refresh tokens
* HTTP-only cookies
* Refresh token rotation

### Middleware Security

* Protected routes using auth middleware

### Error Handling

* Custom ApiError
* Global error middleware
* Consistent JSON responses

### Scalable Design

* Modular routes
* Versioned APIs
* Clean separation of concerns

---

## 🌐 API Base URL

/api/v1

---

## 📌 Important Endpoints

### Auth

* POST /users/register
* POST /users/login
* POST /users/logout
* POST /users/refresh-tokens

### Users

* GET /users/me
* PATCH /users/me
* PATCH /users/change-password
* DELETE /users/me

### Projects

* POST /projects
* GET /projects/explore
* GET /projects/:projectId
* PATCH /projects/:projectId
* DELETE /projects/:projectId

### Requests

* POST /requests/project/:projectId
* GET /requests/project/:projectId
* GET /requests/project/me
* DELETE /requests/:requestId
* PATCH /requests/:requestId (in progress)

---

## 🔄 Authentication Flow

* Access Token → Used for API requests
* Refresh Token → Used to generate new access tokens
* Tokens stored in HTTP-only cookies
* Automatic session renewal using refresh endpoint

---

## 📁 Project Structure

Backend/
├── src/
│   ├── config/
│   │   └── dbConnection.js
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   └── request.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   └── request.model.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   └── request.routes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── AsyncHandler.js
│   │   ├── validators.js
│   │   └── projectValidators.js
│   ├── constants.js
│   ├── app.js
│   └── server.js
├── .env
├── package.json
└── README.md

---

## ⚙️ Environment Variables

PORT=4000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=your_frontend_url

ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=7d

---

## ▶️ Getting Started

git clone https://github.com/kavyagrwl25/TeamForge.git
cd teamforge
npm install
npm run dev

---

## 📊 Current Status

### ✅ Completed

* Backend Architecture
* Authentication System
* User Management
* Project CRUD
* Request System
* API Structure & Middleware
* Error Handling

### 🚧 In Progress

* Request Accept/Reject Flow
* Frontend Integration
* Protected Routes in React
* UI for Dashboard & Explore

### 🔮 Planned

* Pagination, Filtering, Search
* Real-time Notifications
* Socket-based Chat
* AI Chatbot (GenAI Integration)
* Email Notifications
* Deployment
* Docker & DevOps
* Full Test Coverage
* API Documentation

---

## 🧪 Testing

* Vitest
* Supertest
* API Integration Testing

---

## 🎯 Why TeamForge?

This is not just a CRUD project. It demonstrates:

* Real-world backend architecture
* Secure authentication design
* Scalable API structure
* Clean code practices
* Collaboration system design

---

## 👨‍💻 Author

Kavya Agrawal

* MERN Stack Developer
* Backend-focused Engineer
* Passionate about building real-world products

---

## ⭐ Support

If you like this project, consider giving it a star ⭐
