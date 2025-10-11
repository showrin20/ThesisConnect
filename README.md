# 🎓 [ThesisConnect](https://drive.google.com/file/d/13ADdAG8xLMrj62bVtvXJ-4fbJPXTd3Zz/view?usp=sharing)

> 👩‍💻 A platform for connecting thesis students, mentors, and collaborators.

![Made with React](https://img.shields.io/badge/Frontend-React.js-blue?style=flat-square\&logo=react)
![Backend](https://img.shields.io/badge/Backend-Express.js-lightgrey?style=flat-square\&logo=express)
![Database](https://img.shields.io/badge/Database-MongoDB-green?style=flat-square\&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?style=flat-square\&logo=tailwindcss)
![Render](https://img.shields.io/badge/Deployment-Render-purple?style=flat-square)


## 📌 Overview

**ThesisConnect** is a complete ecosystem for **academic collaboration, research sharing, and scholarly communication** — designed specifically for thesis and research work management.
Built with a modern tech stack (**React, Node.js, Express, MongoDB**), it empowers students, mentors, and admins with an all-in-one platform to manage blogs, projects, publications, and community interactions.



## 🚀 Features

### 🔐 Authentication & User Management

* **User Registration & Login** – Secure **JWT-based authentication**
* **Protected Routes** – Role-based access control (Student, Mentor, Admin)
* **User Profiles** – Editable profiles with image uploads & personal details
* **Multi-role Support** – Different dashboards for different roles



### 📊 Dashboard System

* **Student Dashboard** – Personalized academic workspace
* **Mentor Dashboard** – Supervision & mentoring tools
* **Admin Dashboard** – Full control panel for managing platform content & users
* **Role-based Navigation** – Sidebar menus tailored to each user type
* **Statistics Cards** – Track activity, progress, and engagement



### 📝 Blog Management System

* **Create, Edit, Delete Blogs** – Rich text editor with image upload
* **Public Blog Publishing** – Share ideas & research insights
* **Like System** – Engage with community posts
* **View Counter** – Track readership & engagement
* **Tags & Categories** – Organize blogs for better discovery



### 🚀 Project Hub

* **Project Submission** – Comprehensive project forms
* **Project Showcase** – Interactive project cards with external links
* **Status Tracking** – Active, Under Review, Completed
* **Skill & Technology Tags** – Easy filtering & categorization
* **My Projects** – Personal portfolio management



### 📚 Publications Management

* **Publication Repository** – Store academic papers & publications
* **Advanced Search & Filters** – By type, genre, quality, year, tags
* **Publication Types** – Journal, Conference, Workshop, Book Chapter
* **Quality Rankings** – Q1–Q4 journal classifications
* **DOI Integration** – Direct links to academic sources
* **Citation Tracking** – Measure academic impact
* **Multi-Author Support** – Collaborative publication entries



### 🏠 Landing & Navigation

* **Responsive Home Page** – Mobile-friendly design
* **Explore Section** – Discover blogs, projects, publications
* **Settings Page** – Manage preferences and configurations
* **Coming Soon Pages** – For upcoming features



### 🔍 Search & Discovery

* **Global Search** – Search across blogs, projects, publications
* **Advanced Filters** – Narrow results by multiple criteria
* **Tag-based Browsing** – Discover content by topics of interest



### 🎨 UI/UX Features

* **Glass Morphism** & **Gradient Themes**
* **Dark/Light Mode** toggle
* **Responsive Design** – Optimized for mobile & desktop
* **Interactive Cards** – Smooth hover effects & animations
* **Loading States** & **Form Validation**



### 🔧 Technical Features

* **RESTful API** – Well-structured endpoints
* **File Uploads** – Images & documents
* **MongoDB Integration** – With Mongoose ODM
* **CORS Support** – Cross-origin request handling
* **Middleware Protection** – Validation & route security
* **State Management** – Context API for global state



### 🛡️ Security Features

* **JWT Token Validation** – Secure authentication
* **Role-based Access Control**
* **Input Sanitization** – Prevent XSS attacks
* **Secure HTTP Headers**
* **Ownership Validation** – Users can only edit their own content



### 📱 Community Features

* **User Interaction** – Likes, comments, content sharing
* **Public Profiles** – Showcase user contributions
* **Activity Tracking** – Monitor user engagement



### 📈 Analytics & Tracking

* **View Counters** – For blogs, projects, publications
* **Like Tracking** – Engagement metrics
* **Content Statistics** – Performance analysis



### 🔮 Future-Ready Features

* **Extensible Architecture** – Easy feature addition
* **API-First Design** – Mobile app ready
* **Scalable Database** – Built for growth
* **Reusable UI Components** – Modular design



## 🎯 Core Value Propositions

* **Academic Collaboration** – Connect students, mentors, and researchers
* **Knowledge Sharing** – Share research & academic insights
* **Project Showcase** – Highlight academic and research work
* **Publication Discovery** – Find relevant scholarly publications
* **Community Building** – Foster research-driven connections
* **Progress Tracking** – Monitor academic growth and achievements



## 🛠 Tech Stack

* **Frontend** – React, TailwindCSS
* **Backend** – Node.js, Express
* **Database** – MongoDB (Mongoose ODM)
* **Authentication** – JWT
* **Deployment** – API-ready for scaling to mobile apps









## 🚀 Getting Started with ThesisConnect

To run the project locally, follow these steps:

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/showrin20/ThesisConnect.git
cd ThesisConnect
```



### 2. 🖥️ Start the Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

This will start the frontend server at [http://localhost:5173](http://localhost:5173)



### 3. 🧠 Start the Backend (Node.js + Express)

Open a **new terminal** window:

```bash
cd server
npm install
npm start
```

This will start the backend API server at [http://localhost:1085](http://localhost:1085)



### 📌 Notes

* Make sure MongoDB is running locally or your `.env` file has the correct database URI.
* The backend should serve API endpoints and handle authentication using JWT.
* CORS config must allow requests from `http://localhost:5173`.






