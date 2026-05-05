# 🧠 TeamForge — Backend Project Flow (Revision Guide)

---

## 1. 🏁 High-Level Overview

TeamForge is a **developer collaboration platform** where users can create projects and collaborate with others.

### 🔄 Core Flow:

```
User → Authentication → Projects → Requests → Owner Actions → Notifications
```

---

## 2. 🔐 Authentication Flow

```
User sends login/register request
        ↓
Backend validates input
        ↓
User created / verified in DB
        ↓
Access Token + Refresh Token generated
        ↓
Tokens sent as HTTP-only cookies
```

### 🧠 Key Points:

* Uses **JWT Authentication**
* Tokens stored in **httpOnly cookies**
* `accessToken` → short-lived
* `refreshToken` → used for new access tokens
* Secure because cookies are not accessible via JS

---

## 3. 🛡️ Protected Route Flow

```
Request from frontend (cookies auto sent)
        ↓
verifyToken middleware
        ↓
Token decoded
        ↓
User attached to req.user
        ↓
Controller logic executes
```

### 🔑 Used in:

* Create Project
* Send Request
* Update/Delete resources

---

## 4. 📦 Project Flow

### ➤ Create Project

```
POST /projects
        ↓
Validate input
        ↓
Attach createdBy = req.user._id
        ↓
Save in database
```

---

### ➤ Explore Projects

```
GET /projects
        ↓
Exclude current user's projects
        ↓
Filter status = open
        ↓
Apply search (regex)
        ↓
Apply pagination (skip + limit)
        ↓
Return projects
```

---

### ➤ My Projects

```
GET /projects/me
        ↓
Filter createdBy = current user
        ↓
Sort by latest
        ↓
Apply pagination
        ↓
Return projects
```

---

### ➤ Update/Delete Project

```
User sends request
        ↓
Validate projectId
        ↓
Check ownership (createdBy === req.user._id)
        ↓
Perform update/delete
```

---

## 5. 🤝 Request Flow (Collaboration)

### ➤ Send Request

```
POST /requests/project/:projectId
        ↓
Validate project exists
        ↓
Prevent:
  - requesting own project
  - duplicate requests
        ↓
Save request in DB
```

---

### ➤ Get Requests (Owner Side)

```
GET /requests/project/:projectId
        ↓
Verify project owner
        ↓
Fetch all requests
        ↓
Populate requestedBy details
        ↓
Apply pagination
```

---

### ➤ My Sent Requests

```
GET /requests/project/me
        ↓
Fetch requests where requestedBy = current user
        ↓
Populate project details
        ↓
Apply pagination
```

---

### ➤ Update Request Status

```
PATCH /requests/:requestId
        ↓
Validate request
        ↓
Only project owner allowed
        ↓
Update status (accepted/rejected)
```

---

### ➤ Delete Request

```
DELETE /requests/:requestId
        ↓
Only requester allowed
        ↓
Prevent deleting accepted requests
        ↓
Delete from DB
```

---

## 6. 🔎 Pagination & Search

### Pagination:

```
page = req.query.page || 1
limit = req.query.limit || 10

skip = (page - 1) * limit
```

### Search:

```
Use regex with case-insensitive option

Example:
{ title: { $regex: search, $options: "i" } }
```

---

## 7. ⚠️ Edge Cases Handled

* ❌ Invalid ObjectId validation
* ❌ Duplicate collaboration requests
* ❌ User requesting own project
* ❌ Unauthorized access (ownership checks)
* ❌ Orphan requests (when project deleted)
* ❌ Empty / invalid inputs

---

## 8. 🚫 Rate Limiting (Security)

```
Global Limiter → Applied to all routes
Auth Limiter → Strict limit on login/register
```

### 🧠 Purpose:

* Prevent brute force attacks
* Avoid API abuse
* Improve backend stability

---

## 9. ⚡ Socket.IO (Real-Time Notifications)

```
User connects → socket.id generated
        ↓
Map userId → socketId
        ↓
Event triggered (new request)
        ↓
Backend finds project owner
        ↓
Emit event to owner's socket
```

### 🧠 Important:

* Socket connection is separate from HTTP
* Real-time only works if mapping is correct

---

## 10. 🔄 Final Backend Flow Summary

```
User logs in
        ↓
Receives tokens (cookies)
        ↓
Uses platform (projects + requests)
        ↓
Backend verifies every protected request
        ↓
DB operations performed
        ↓
Optional real-time notifications triggered
```

