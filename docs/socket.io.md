# 🚀 TeamForge Socket.IO — Revision Notes (Short)

## 1. Core Idea
REST API → database operations  
Socket.IO → real-time updates  
MongoDB → persistent notifications  

Socket.IO does NOT replace REST APIs. It only adds real-time capability.

---

## 2. Full Flow (MOST IMPORTANT)

User B sends request
→ Backend creates request
→ Backend creates notification in DB
→ Backend checks: is User A online?

IF ONLINE:
→ find socketId using userId
→ emit "new-notification"
→ frontend receives → UI updates instantly

IF OFFLINE:
→ notification stored in DB
→ frontend fetches later using API

---

## 3. Backend Socket Flow

Frontend connects socket:
→ sends userId in auth

Backend:
→ receives userId
→ stores mapping: userId → socketId

This mapping allows sending notifications to specific users.

---

## 4. Emit Notification (Backend)

const socketId = getUserSocket(userId);

if (socketId) {
  getIO().to(socketId).emit("new-notification", notification);
}

Key idea:
io.to(socketId) → send to specific user only

---

## 5. Frontend Socket Flow

Connect socket:

const socket = io(BACKEND_URL, {
  withCredentials: true,
  auth: {
    userId: currentUser._id
  }
});

Listen for notifications:

socket.on("new-notification", (notification) => {
  setNotifications(prev => [notification, ...prev]);
});

---

## 6. Notification State (Frontend)

const [notifications, setNotifications] = useState([]);

Unread count:

const unreadCount = notifications.filter(n => !n.isRead).length;

UI updates automatically when state changes.

---

## 7. Fetch Old Notifications

GET /api/v1/notifications

Used when:
→ user opens app
→ loads notifications from DB

---

## 8. Mark as Read

PATCH /api/v1/notifications/:id/read

Frontend updates:

setNotifications(prev =>
  prev.map(n =>
    n._id === id ? { ...n, isRead: true } : n
  )
);

---

## 9. One Event Design

Use single event:
"new-notification"

Different types handled by:

notification.type

Example:
NEW_REQUEST
REQUEST_STATUS_UPDATED

This is scalable.

---

## 10. Important Concepts

- Socket.IO = long-lived connection
- REST API = request-response
- DB needed because socket works only when user is online
- userId → socketId mapping is core logic
- io.to(socketId).emit() = targeted messaging

---

## 11. Common Mistakes

- Wrong socket URL (do NOT use /api/v1)
- Not sending userId in auth
- Event name mismatch
- Duplicate socket listeners
- Wrong populate path (use data.projectId)
