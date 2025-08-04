# 🎓 [ThesisConnect](https://docs.google.com/document/d/1C-v7He-nDQgbw6lyI3BAR52A98BQpnWWdbkWAWkjkrk/edit?usp=sharing)

> 👩‍💻 A platform for connecting thesis students, mentors, and collaborators.

![Made with React](https://img.shields.io/badge/Frontend-React.js-blue?style=flat-square\&logo=react)
![Backend](https://img.shields.io/badge/Backend-Express.js-lightgrey?style=flat-square\&logo=express)
![Database](https://img.shields.io/badge/Database-MongoDB-green?style=flat-square\&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?style=flat-square\&logo=tailwindcss)
![Render](https://img.shields.io/badge/Deployment-Render-purple?style=flat-square)


## 📌 Overview

**ThesisConnect** is a centralized hub for students to:

* Showcase and manage research projects
* Connect with collaborators, mentors & institutions
* Upload and version thesis drafts
* Discover research based on tags, skills, and affiliations

🚀 Built with MERN Stack + Tailwind CSS
💡 Designed to ease academic collaboration and publication.

## 🧩 Features (Modules)

### 🛡️ Module 1: Auth & Profile

* ✅ JWT or OAuth login/signup
* 🖼️ Dynamic profile editor + avatar upload
* 🔐 Role-based access control
* 🏫 Institution & skill tagging

### 📂 Module 2: Projects & Discovery

* 📤 Post & filter research projects
* 🔍 Search by tag, skill, or institution
* ⭐ Bookmark interesting projects
* 🧠 Match with potential collaborators

### 📚 Module 3: Publications, Blogs & Mentorship

* 📝 Publish blogs or research articles (with markdown!)
* 🏷️ Tag-based filtering & related content discovery
* 📅 Mentorship session booking (time slot based)




## 🖼️ UI Preview

Here's a sneak peek at our UI flow 👇  
*All images stored in `/UI/` directory (images 1 to 6)*

| ![UI 1](https://github.com/showrin20/ThesisConnect/blob/main/UI/1.png) | ![UI 2](https://github.com/showrin20/ThesisConnect/blob/main/UI/2.png) | ![UI 3](https://github.com/showrin20/ThesisConnect/blob/main/UI/3.png) |
|:--:|:--:|:--:|
| UI 1 | UI 2 | UI 3 |

| ![UI 5](https://github.com/showrin20/ThesisConnect/blob/main/UI/5.png) | ![UI 4](https://github.com/showrin20/ThesisConnect/blob/main/UI/4.png) | ![UI 6](https://github.com/showrin20/ThesisConnect/blob/main/UI/6.png) |
|:--:|:--:|:--:|
| UI 4 | UI 5 | UI 6 |

---
---

## ⚙️ Tech Stack

| Tech            | Purpose              |
| --------------- | -------------------- |
| **React.js**    | Frontend SPA         |
| **Express.js**  | Backend API          |
| **MongoDB**     | NoSQL Database       |
| **TailwindCSS** | UI Styling           |
| **Render**      | Hosting & Deployment |

---


## 🚀 Getting Started with ThesisConnect

To run the project locally, follow these steps:

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/showrin20/ThesisConnect.git
cd ThesisConnect
```

---

### 2. 🖥️ Start the Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

This will start the frontend server at [http://localhost:5173](http://localhost:5173)

---

### 3. 🧠 Start the Backend (Node.js + Express)

Open a **new terminal** window:

```bash
cd server
npm install
npm start
```

This will start the backend API server at [http://localhost:5001](http://localhost:5001)

---

### 📌 Notes

* Make sure MongoDB is running locally or your `.env` file has the correct database URI.
* The backend should serve API endpoints and handle authentication using JWT.
* CORS config must allow requests from `http://localhost:5173`.




---

