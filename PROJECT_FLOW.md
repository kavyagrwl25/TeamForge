# TeamForge Backend Project Flow

## 1. Project Overview

**TeamForge** is a developer collaboration platform where users can create projects, explore other developers’ projects, and send requests to join those projects with a pitch and preferred role.

The backend is built using the **MERN stack backend layer**:

* **Node.js** runtime
* **Express.js** for REST APIs
* **MongoDB** as database
* **Mongoose** as ODM
* **JWT authentication** using access and refresh tokens
* **HTTP-only cookies** for safer token storage
* **Socket.IO** planned/partially added for real-time notifications
* **express-rate-limit** for API abuse protection

---

## 2. Main Backend Responsibilities

The backend mainly handles:

1. User registration, login, logout, token refresh, and profile management
2. Project creation, update, deletion, search, pagination, and explore feed
3. Request system where users can apply to other users’ projects
4. Authorization checks so only owners/requesters can perform sensitive actions
5. Global error handling using custom `ApiError`
6. Consistent API responses using `ApiResponse`
7. Rate limiting for security and abuse prevention
8. Real-time notification groundwork using Socket.IO

---

## 3. High-Level Backend Architecture

```txt
Client / Frontend
      |
      | HTTP request with cookies / Authorization header
      v
Express App
      |
      | Middlewares
      | - cors
      | - express.json
      | - cookieParser
      | - rateLimit
      | - verifyToken for protected routes
      v
Routes
      |
      | user.routes.js
      | project.routes.js
      | request.routes.js
      v
Controllers
      |
      | Business logic
      | Validation
      | DB queries
      v
Models
      |
      | User
      | Project
      | Request
      v
MongoDB
```

---

## 4. Important Folder/File Structure

```txt
src/
  app.js
  index.js

  routes/
    user.routes.js
    project.routes.js
    request.routes.js

  controllers/
    user.controller.js
    project.controller.js
    request.controller.js

  models/
    user.model.js
    project.model.js
    request.model.js

  middlewares/
    auth.middleware.js
    error.middleware.js

  utils/
    ApiError.js
    ApiResponse.js
    asyncHandler.js

  validators/
    user.validator.js
    project.validator.js
    request.validator.js
```

---

## 5. App Entry Flow

### `index.js`

Main responsibilities:

1. Load environment variables
2. Connect to MongoDB
3. Start the server
4. If Socket.IO is used, create HTTP server manually and attach Socket.IO

Typical flow:

```txt
Load env
  ↓
Connect MongoDB
  ↓
Create Express app / HTTP server
  ↓
Attach Socket.IO if needed
  ↓
server.listen(PORT)
```

### Why `server.listen()` instead of `app.listen()` when using Socket.IO?

`app.listen()` internally creates an HTTP server automatically.

But Socket.IO needs direct access to the HTTP server, so we manually do:

```js
const server = createServer(app);
const io = new Server(server);
server.listen(PORT);
```

This allows both normal HTTP APIs and Socket.IO connections to run on the same server.

---

## 6. Express App Flow

### `app.js`

Main responsibilities:

1. Create Express app
2. Apply global middlewares
3. Apply rate limiters
4. Mount routes
5. Add central error handler

Typical flow:

```txt
Create app
  ↓
app.set("trust proxy", 1)
  ↓
Apply CORS
  ↓
Apply cookieParser
  ↓
Apply express.json / urlencoded
  ↓
Apply global rate limiter
  ↓
Mount routes under /api/v1
  ↓
Central error middleware
```

Example route mounting:

```js
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/requests", requestRoutes);
```

---

## 7. Auth Flow

TeamForge uses JWT-based authentication with cookies.

### Login Flow

```txt
User sends email/password
  ↓
Backend validates input
  ↓
Find user in DB
  ↓
Compare password
  ↓
Generate access token and refresh token
  ↓
Save refresh token in DB
  ↓
Send tokens as HTTP-only cookies
  ↓
Return user data without password/refresh token
```

### Why HTTP-only cookies?

HTTP-only cookies cannot be accessed using frontend JavaScript. This reduces risk from XSS attacks compared to storing tokens in localStorage.

### Access Token

Used for authenticating protected requests.

Short-lived.

### Refresh Token

Used to generate a new access token when the access token expires.

Longer-lived.

Usually stored in DB so backend can verify and rotate it.

---

## 8. `verifyToken` Middleware Flow

Used to protect private routes.

```txt
Request comes to protected route
  ↓
Check access token from cookies or Authorization header
  ↓
If token missing → throw 401 error
  ↓
Verify token using JWT secret
  ↓
Extract user id from payload
  ↓
Find user in DB or attach decoded user info
  ↓
Set req.user
  ↓
Call next()
```

After this middleware runs, controllers can access:

```js
req.user._id
```

This helps identify the currently logged-in user.

---

## 9. User Routes Flow

Base route:

```txt
/api/v1/users
```

Important routes:

```txt
POST   /register          Register user
POST   /login             Login user
POST   /logout            Logout user
POST   /refresh-tokens    Refresh access token
GET    /me                Get current logged-in user
PATCH  /me                Update profile
PATCH  /me/password       Change password
```

### Register Controller Flow

```txt
Get fullName, userName, email, password
  ↓
Validate fields
  ↓
Check if user already exists
  ↓
Create user
  ↓
Remove password/refreshToken from response
  ↓
Return success response
```

### Login Controller Flow

```txt
Get email/userName and password
  ↓
Validate input
  ↓
Find user
  ↓
Compare password
  ↓
Generate tokens
  ↓
Set cookies
  ↓
Return logged-in user
```

### Logout Controller Flow

```txt
Get current user from req.user
  ↓
Remove refresh token from DB
  ↓
Clear cookies
  ↓
Return success response
```

---

## 10. Project Model Concept

A project usually contains:

```txt
title
description
techStack
rolesNeeded / techRoles
projectType
repoLink
status
createdBy
createdAt
updatedAt
```

Important relation:

```txt
Project.createdBy → User._id
```

This tells who owns the project.

---

## 11. Project Routes Flow

Base route:

```txt
/api/v1/projects
```

Important routes:

```txt
POST    /              Create project
GET     /              Explore projects
GET     /me            Get my projects
GET     /:projectId    Get project by id
PATCH   /:projectId    Update project
DELETE  /:projectId    Delete project
```

Important route ordering:

```txt
/me should come before /:projectId
```

Because if `/:projectId` comes first, Express may treat `me` as a projectId.

---

## 12. Create Project Flow

```txt
Logged-in user sends project details
  ↓
verifyToken adds req.user
  ↓
Validate title, description, repoLink, etc.
  ↓
Create project with createdBy = req.user._id
  ↓
Return created project
```

Key point:

The frontend should not send `createdBy`. Backend should take it from authenticated user.

```js
createdBy: req.user._id
```

This prevents users from creating projects on behalf of someone else.

---

## 13. Explore Projects Flow

Purpose:

Show projects created by other users, not the current user.

```txt
Logged-in user opens Explore page
  ↓
Backend gets req.user._id
  ↓
Find projects where createdBy != current user
  ↓
Usually filter status = open
  ↓
Apply search if provided
  ↓
Apply pagination
  ↓
Return projects + totalPages + totalCount
```

Important MongoDB condition:

```js
createdBy: { $ne: req.user._id }
```

Default filter:

```js
status: "open"
```

---

## 14. My Projects Flow

Purpose:

Show projects created by the logged-in user.

```txt
Logged-in user opens My Projects
  ↓
Backend gets req.user._id
  ↓
Find projects where createdBy = current user
  ↓
Apply search if provided
  ↓
Apply pagination
  ↓
Sort by latest first
  ↓
Return projects + pagination data
```

Important MongoDB condition:

```js
createdBy: req.user._id
```

---

## 15. Pagination Flow

Backend receives:

```txt
?page=1&limit=10
```

Controller logic:

```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
```

DB query:

```js
Project.find(query)
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });
```

Also count total documents:

```js
const totalCount = await Project.countDocuments(query);
const totalPages = Math.ceil(totalCount / limit);
```

Response should include:

```txt
projects
totalCount
totalPages
currentPage
limit
```

---

## 16. Search Flow

Frontend sends:

```txt
?search=react
```

Backend:

```txt
Read search from req.query
  ↓
Trim search value
  ↓
Escape regex special characters
  ↓
Add $or condition
  ↓
Search title, description, techStack, rolesNeeded
```

Example query idea:

```js
query.$or = [
  { title: { $regex: safeSearch, $options: "i" } },
  { description: { $regex: safeSearch, $options: "i" } },
  { techStack: { $elemMatch: { $regex: safeSearch, $options: "i" } } },
  { rolesNeeded: { $elemMatch: { $regex: safeSearch, $options: "i" } } }
];
```

Why escape regex?

To prevent special characters like `.*`, `$`, `[]`, etc. from behaving unexpectedly or dangerously in regex search.

---

## 17. Update Project Flow

```txt
User sends projectId in params
  ↓
Validate projectId
  ↓
Find project
  ↓
Check if project exists
  ↓
Check if project.createdBy == req.user._id
  ↓
Validate update fields
  ↓
Update project
  ↓
Return updated project
```

Important authorization check:

```js
if (project.createdBy.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "You are not allowed to update this project");
}
```

---

## 18. Delete Project Flow

```txt
User sends projectId
  ↓
Validate projectId
  ↓
Find project
  ↓
Check ownership
  ↓
Delete project
  ↓
Optionally delete related requests
  ↓
Return success response
```

Important interview point:

When deleting a project, related requests may become orphaned. A better production approach is either:

1. Delete all requests related to that project, or
2. Use soft delete for projects, or
3. Clean orphan requests during fetch

---

## 19. Request Model Concept

A request usually contains:

```txt
requestedBy
project
roleRequested
pitchMessage
status
createdAt
updatedAt
```

Relations:

```txt
Request.requestedBy → User._id
Request.project → Project._id
```

Status values:

```txt
pending
accepted
rejected
```

---

## 20. Request Routes Flow

Base route:

```txt
/api/v1/requests
```

Important routes:

```txt
POST    /project/:projectId       Send request to join project
GET     /project/:projectId       Get requests for my project
GET     /project/me               Get my sent requests
PATCH   /request/:requestId       Update request status
DELETE  /:requestId               Delete/cancel request
```

Important route ordering:

`/project/me` should be placed before `/project/:projectId` if both are GET routes.

Otherwise Express may treat `me` as a projectId.

---

## 21. Create Request Flow

Purpose:

A user applies to join someone else’s project.

```txt
User clicks Request / Apply
  ↓
Frontend sends projectId, roleRequested, pitchMessage
  ↓
verifyToken adds req.user
  ↓
Validate projectId
  ↓
Check if project exists
  ↓
Check user is not requesting own project
  ↓
Check duplicate request does not already exist
  ↓
Create request
  ↓
Populate requestedBy and project
  ↓
Optionally emit Socket.IO notification to project owner
  ↓
Return created request
```

Important checks:

```js
if (project.createdBy.toString() === req.user._id.toString()) {
  throw new ApiError(400, "You cannot request your own project");
}
```

Duplicate check:

```js
const existingRequest = await Request.findOne({
  requestedBy: req.user._id,
  project: projectId
});
```

---

## 22. Get Requests For My Project Flow

Purpose:

Project owner can see who applied to their project.

```txt
Owner opens requests page for a project
  ↓
Backend gets projectId
  ↓
Validate projectId
  ↓
Find project
  ↓
Check project.createdBy == req.user._id
  ↓
Find all requests for that project
  ↓
Populate requestedBy user details
  ↓
Apply pagination
  ↓
Return requests
```

Important authorization point:

Only the project owner can view requests for that project.

---

## 23. Get My Sent Requests Flow

Purpose:

Logged-in user can see requests they have sent to other projects.

```txt
User opens My Sent Requests
  ↓
Backend gets req.user._id
  ↓
Find requests where requestedBy = req.user._id
  ↓
Populate project details
  ↓
Apply pagination
  ↓
Sort latest first
  ↓
Return requests
```

Important query:

```js
requestedBy: req.user._id
```

Production improvement:

If a project is deleted, the related sent request may become orphaned. Handle this by cleanup or filtering.

---

## 24. Update Request Status Flow

Purpose:

Project owner accepts or rejects a request.

```txt
Owner sends requestId and new status
  ↓
Validate requestId
  ↓
Validate status
  ↓
Find request and populate project
  ↓
Check project owner is current user
  ↓
Update status to accepted/rejected
  ↓
Return updated request
```

Important point:

Only the project owner should be able to accept/reject a request.

---

## 25. Delete Request Flow

Purpose:

Requester can cancel their own request.

```txt
User sends requestId
  ↓
Validate requestId
  ↓
Find request
  ↓
Check request.requestedBy == req.user._id
  ↓
If accepted, optionally prevent deletion
  ↓
Delete request
  ↓
Return success response
```

Important point:

A user should not be able to delete someone else’s request.

---

## 26. Socket.IO Notification Flow

Goal:

When User A sends a request to User B’s project, User B should receive a real-time notification.

High-level flow:

```txt
Frontend connects to Socket.IO after login
  ↓
Backend gets socket connection
  ↓
Map logged-in userId with socket.id
  ↓
User A sends project request via HTTP API
  ↓
Backend creates request in DB
  ↓
Backend finds project ownerId
  ↓
Backend checks owner socketId from map
  ↓
If owner online, emit notification to that socketId
  ↓
Owner frontend listens and updates notification bell/UI
```

Important idea:

Socket.IO does not replace HTTP APIs. It is used only for real-time events.

HTTP is still used for:

```txt
login
register
create project
send request
fetch projects
update status
```

Socket.IO is used for:

```txt
new request notification
future chat
live collaboration
```

---

## 27. User Socket Map Concept

A map stores which user is connected to which socket.

```js
const userSocketMap = new Map();
```

Example:

```txt
userId123 → socketIdABC
userId456 → socketIdXYZ
```

When emitting notification:

```js
const socketId = getUserSocket(ownerId);
if (socketId) {
  io.to(socketId).emit("new-request", notificationData);
}
```

Important point:

For this to work, the frontend must identify the logged-in user when connecting socket.

---

## 28. Rate Limiting Flow

TeamForge uses rate limiting to protect APIs from abuse.

### Global Limiter

Applied to all routes.

Example:

```txt
100 requests per 15 minutes per IP
```

### Auth Limiter

Applied specifically to login/register routes.

Example:

```txt
5 requests per 15 minutes per IP
```

Why stricter auth limiter?

Auth routes are more sensitive because attackers may try brute-force login attempts.

---

## 29. `trust proxy` Concept

Used when app is behind a proxy or deployment platform.

```js
app.set("trust proxy", 1);
```

Why needed?

In production, the real client IP may come through proxy headers like `X-Forwarded-For`.

Rate limiters need the correct IP to apply limits properly.

---

## 30. Error Handling Flow

TeamForge uses centralized error handling.

### `asyncHandler`

Instead of writing try-catch in every controller:

```js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

If controller throws an error, it goes to central error middleware.

### `ApiError`

Used to throw custom errors:

```js
throw new ApiError(400, "Invalid project id");
```

### Central Error Middleware

Returns consistent error response:

```json
{
  "success": false,
  "message": "Invalid project id",
  "errors": [],
  "data": null
}
```

---

## 31. API Response Format

Success response format:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "success": true
}
```

Why use this?

It keeps API responses consistent and easier for frontend to handle.

---

## 32. Important Backend Security Points

TeamForge includes or should include:

1. Password hashing before saving password
2. JWT access and refresh tokens
3. HTTP-only cookies
4. CORS configured with frontend origin
5. `credentials: true` for cookie-based auth
6. Rate limiting
7. Ownership checks before update/delete
8. Input validation
9. ObjectId validation before DB queries
10. Centralized error handling

---

## 33. Important Interview Explanations

### How will you explain TeamForge?

TeamForge is a MERN-based developer collaboration platform where developers can create project posts, explore other open projects, and send requests to collaborate. I built the backend with Express, MongoDB, JWT authentication, protected routes, project ownership checks, request management, pagination, search, rate limiting, and real-time notification groundwork using Socket.IO.

### What was your main backend learning?

I learned how to design REST APIs with authentication, authorization, reusable middlewares, centralized error handling, consistent responses, pagination, searching, and real-time event flow.

### What security features did you implement?

I used JWT authentication with HTTP-only cookies, refresh tokens, protected routes, ownership-based authorization, input validation, ObjectId validation, CORS with credentials, and rate limiting for sensitive routes.

### Why did you use pagination?

Without pagination, fetching all projects or requests at once can slow down the backend and frontend as data grows. Pagination helps return limited data per request and improves performance and user experience.

### Why did you use search?

Search improves user experience by allowing users to find projects based on title, description, tech stack, or required roles.

### Why did you use rate limiting?

Rate limiting protects the backend from abuse, spam, brute-force login attempts, and excessive requests from the same IP.

### Why Socket.IO?

Socket.IO is useful for real-time features like notifications and future chat. Normal HTTP APIs are request-response based, while Socket.IO allows the server to push events to connected users instantly.

---

## 34. Common Bugs I Faced / Things To Remember

1. Route order matters: `/me` should come before `/:projectId`
2. Frontend query params are not written in backend route paths
3. Cookies require `withCredentials: true` in frontend axios
4. CORS must allow the exact frontend origin
5. User ownership must be checked before update/delete
6. Search should reset page to 1 on frontend
7. Pagination response should include total pages and total count
8. Deleted projects can create orphan requests if not handled
9. Socket.IO connection happens separately from normal HTTP request
10. Socket.IO notification works only if userId is correctly mapped to socketId

---

## 35. Resume-Worthy Backend Points

Possible resume bullets:

* Built a MERN-based developer collaboration platform with JWT authentication, HTTP-only cookies, protected routes, and refresh token flow.
* Designed REST APIs for project creation, discovery, collaboration requests, ownership-based authorization, pagination, and search.
* Implemented centralized error handling, reusable API response structure, input validation, and ObjectId validation for cleaner backend architecture.
* Added rate limiting for global and authentication routes to reduce abuse and improve API security.
* Integrated Socket.IO groundwork for real-time request notifications between project applicants and owners.

---

## 36. Final Backend Flow Summary

```txt
User logs in
  ↓
Backend verifies credentials
  ↓
Access/refresh tokens sent as HTTP-only cookies
  ↓
User creates project
  ↓
Other users explore open projects
  ↓
User sends request to join project
  ↓
Backend validates request and prevents duplicate/self-request
  ↓
Project owner sees incoming requests
  ↓
Owner accepts/rejects request
  ↓
Requester can view sent request status
  ↓
Socket.IO can notify owner in real time
```

---

## 37. Before Interview Revision Checklist

Revise these in order:

1. Explain the project in 60 seconds
2. Explain auth flow
3. Explain access token vs refresh token
4. Explain why HTTP-only cookies
5. Explain protected routes and `verifyToken`
6. Explain project CRUD flow
7. Explain request create/update/delete flow
8. Explain ownership checks
9. Explain pagination formula
10. Explain search query
11. Explain rate limiting
12. Explain Socket.IO notification flow
13. Explain common bugs and fixes
14. Explain one production improvement
15. Explain one challenge you faced and how you solved it

---

## 38. Strong Interview Ending Line

This project helped me understand how a real backend grows beyond basic CRUD. I learned authentication, authorization, pagination, searching, rate limiting, error handling, and real-time communication, while also facing real integration bugs between frontend and backend.
