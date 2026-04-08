# 🚀 TeamForge

**TeamForge** is a developer collaboration platform where users can showcase their skills, explore project ideas, and collaborate with like-minded developers.

---

## 🌟 Features

* 👤 User Authentication (JWT-based)
* 🔐 Secure Login & Logout System
* 🧑‍💻 Developer Profiles (skills, bio, social links)
* 📌 Create & Explore Project Ideas
* 🤝 Send Collaboration Requests
* 📬 Manage Incoming Requests (accept/reject)
* 🔄 Token-based Authentication with Refresh Tokens

---

## 🛠️ Tech Stack

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)

**Authentication:**

* JWT (Access + Refresh Tokens)
* Bcrypt (Password Hashing)
* Cookie-based Authentication

---

## 📁 Project Structure

```
Backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
└── app.js / server.js
```

---

## 🔑 API Endpoints (Sample)

### Auth Routes

* `POST /api/v1/users/register`
* `POST /api/v1/users/login`
* `POST /api/v1/users/logout`

### User Routes

* `GET /api/v1/users/me`
* `PATCH /api/v1/users/profile`
* `PATCH /api/v1/users/password`

### Project Routes *(WIP)*

* Create Project
* Browse Projects
* Apply to Projects

---

## ⚙️ Installation & Setup

```bash
# Clone the repo
git clone https://github.com/kavyagrwl25/TeamForge.git

# Navigate to backend
cd TeamForge/Backend

# Install dependencies
npm install

# Create .env file
```

### 🔐 Environment Variables

```env
PORT=4000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CORS_ORIGIN=http://localhost:5173
```

---

## ▶️ Run the Server

```bash
npm run dev
```

Server will start at:

```
http://localhost:4000
```

---

## 📌 Current Status

* ✅ Authentication System Completed
* ✅ User Profile APIs Completed
* 🔄 Project Module (In Progress)
* 🔄 Request/Collaboration System (Planned)

---

## 🚧 Future Enhancements

* 📧 Email Verification System
* 💬 Real-time Chat (Socket.io)
* 🔔 Notifications System
* 🌐 Frontend Integration (React)
* 🚀 Deployment (Docker + Cloud)

---

## 🤝 Contributing

Currently a personal project, but open to collaboration ideas.

---

## 👨‍💻 Author

**Kavy**
Frontend + Backend Developer | MERN Stack | DSA Enthusiast

---

## ⭐ Support

If you like this project, consider giving it a ⭐!
