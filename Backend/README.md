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

## Features

### Authentication
- User registration
- User login
- Secure logout
- JWT-based authentication
- Access token and refresh token flow
- Refresh token rotation
- Cookie-based session handling

### User Management
- Get current user profile
- Update user profile
- Change password
- Delete account

### API Foundation
- Versioned REST API structure
- Protected routes using authentication middleware
- Global error handling
- Centralized async controller handling
- Structured API responses
- Input validation using custom validators

### Collaboration Modules
- Project routes structure initialized
- Request routes structure initialized
- Backend foundation ready for project and collaboration workflows

---

## Tech Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication and Security
- JWT
- bcrypt
- HTTP-only cookies
- CORS

### Development Tools
- Nodemon
- Postman

### Testing
- vitest
- Supertest

---

## Project Structure

```bash
Backend/
├── src/
│   ├── config/
│   │   └── dbConnection.js          # MongoDB connection setup
│   ├── controllers/
│   │   ├── project.controller.js    # Handles project-related business logic
│   │   ├── request.controller.js    # Handles collaboration request logic
│   │   └── user.controller.js       # Handles authentication and user profile logic
│   ├── middleware/
│   │   └── auth.middleware.js       # Verifies JWT and protects private routes
│   ├── models/
│   │   ├── project.model.js         # Mongoose schema for projects
│   │   ├── request.model.js         # Mongoose schema for join requests
│   │   └── user.model.js            # Mongoose schema for users
│   ├── routes/
│   │   ├── project.routes.js        # API routes for project endpoints
│   │   ├── request.routes.js        # API routes for request endpoints
│   │   └── user.routes.js           # API routes for authentication and user endpoints
│   ├── utils/
│   │   ├── ApiError.js              # Custom error class for standardized error handling
│   │   ├── ApiResponse.js           # Standardized success response wrapper
│   │   ├── AsyncHandler.js          # Utility to handle async route errors cleanly
│   │   ├── projectValidators.js     # Validation helpers for project-related fields
│   │   └── validators.js            # Common validation helpers for user input
│   ├── app.js                       # Express app setup, middleware, and route mounting
│   ├── constants.js                 # Application-wide constants
│   └── server.js                    # Entry point that starts the server
├── .env                             # Environment variables
├── .gitignore                       # Files and folders ignored by Git
├── package-lock.json                # Exact dependency lock file
├── package.json                     # Project metadata, scripts, and dependencies
└── README.md                        # Project documentation

```

## Architecture Highlights

### 1. Token-Based Authentication

TeamForge uses JWT authentication with:

- short-lived access tokens for authorization
- refresh tokens for session renewal
- HTTP-only cookies for improved security
- refresh token rotation for safer session handling

This design supports a more secure and scalable authentication flow for modern web applications.

### 2. Middleware-Driven Route Protection

Protected routes are secured through authentication middleware that verifies the access token before allowing access to restricted resources.

### 3. Structured Error Handling

The application follows a centralized error-handling approach using:

- custom API error classes
- async controller wrappers
- a global error middleware
- consistent JSON response formatting

This keeps the backend predictable, clean, and easier to integrate with a frontend.

### 4. Scalable REST API Design

The project follows a versioned API structure to support future expansion without breaking existing routes.

---

## API Base URL

    /api/v1

### Route Groups

    /api/v1/users
    /api/v1/projects
    /api/v1/requests

---

## Implemented Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register a new user |
| POST | `/api/v1/users/login` | Log in a user |
| POST | `/api/v1/users/logout` | Log out the current user |
| POST | `/api/v1/users/refresh-tokens` | Refresh access and refresh tokens |

### User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current logged-in user |
| PATCH | `/api/v1/users/me` | Update user profile |
| PATCH | `/api/v1/users/change-password` | Change account password |
| DELETE | `/api/v1/users/me` | Delete user account |

---

## Authentication Flow

TeamForge uses a dual-token authentication model:

- **Access Token**: short-lived token used for protected requests
- **Refresh Token**: long-lived token used to generate new access tokens
- **Cookies**: tokens are stored in HTTP-only cookies
- **Rotation**: refresh tokens are rotated when new tokens are issued

This helps create a smoother user experience while keeping sessions more secure.

---

## Environment Variables

Create a `.env` file in the project root and configure the following:

    PORT=4000
    MONGO_URI=your_mongodb_connection_string
    CORS_ORIGIN=your_frontend_url

    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=15m

    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=7d

---

## Getting Started

### 1. Clone the repository

    git clone https://github.com/your-username/teamforge.git
    cd teamforge

### 2. Install dependencies

    npm install

### 3. Configure environment variables

Create a `.env` file and add the required values.

### 4. Run the development server

    npm run dev

### 5. Start the server normally

    npm start

---

## Health Check

You can verify that the API is running by sending a request to:

    GET /

Expected response:

    {
      "success": true,
      "message": "API is running"
    }

---

## Development Principles

This project is being built with focus on:

- clean code structure
- clear separation of concerns
- reusable utility functions
- scalable backend architecture
- secure authentication practices
- maintainable controller logic
- practical real-world backend design

---

## Current Status

TeamForge is actively under development.

### Completed
- Express app setup
- MongoDB connection setup
- user model
- authentication flow
- login and registration system
- logout system
- refresh token handling
- protected routes
- profile management
- password change flow
- account deletion flow
- global error handling
- route structuring for users, projects, and requests

### In Progress
- project module implementation
- request module implementation
- complete collaboration workflow
- testing coverage

---

## Future Improvements

Planned improvements include:

- full project CRUD implementation
- project discovery feed
- request approval and rejection flow
- notifications system
- real-time chat
- project filtering and search
- frontend integration with React
- deployment
- complete automated test coverage
- API documentation

---

## Testing

Testing support is planned using:

- vitest for test execution
- Supertest for API endpoint testing

---

## Why TeamForge

TeamForge is not just a basic CRUD backend. It is being developed as a product-oriented project that demonstrates:

- backend architecture design
- authentication strategy
- REST API structuring
- middleware usage
- validation handling
- scalable folder organization
- collaboration-focused system design

It is intended to be both a strong portfolio project and a practical learning project for full-stack development.

---

## Author

**Kavya Agrawal**

Engineering student passionate about:

- MERN stack development
- backend engineering
- product building
- solving real-world problems with technology

---

## Support

If you found this project interesting, consider giving it a star.

⭐ Star this repository if you like TeamForge