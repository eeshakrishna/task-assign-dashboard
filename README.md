# 🛠️ Lead Distribution Admin Dashboard

This project provides an Admin Dashboard where you can:

- Add, update, and delete agents
- Upload a CSV/XLSX file containing leads
- Automatically distribute leads evenly among agents
- View assigned leads per agent

---

## 🗂️ Project Structure

project-root/
├── backend/
│   ├── server.js
│   ├── seedAdmin.js
│   └── ...other backend files
├── frontend/
│   └── agg/
│       ├── src/
│       ├── public/
│       └── package.json
├── .gitignore
└── README.md

---

## 🚀 Setup Instructions

### 1. Clone the repository

git clone https://github.com/eeshakrishna/task-assign-dashboard.git

---

### 2. Setup MongoDB

- Open MongoDB Compass
- Create a database named `mernapp`
- Ensure your backend server connects to this database (check connection string in .env file)

---

### 3. Backend (Node.js)

cd backend
npm install

- To create the admin user (run once):

node seedAdmin.js

- To start the backend server:

node server.js

The backend runs at http://localhost:5000

---

### 4. Frontend (React)

cd ../frontend/agg
npm install
npm start

The frontend runs at http://localhost:3000

---

## 🧪 Sample Test File

Upload a CSV/XLSX file with columns:

| FirstName | Phone      | Notes          |
|-----------|------------|----------------|
| Alice     | 1234567890 | Follow-up soon |
| Bob       | 9876543210 | Interested     |

---


## 📄 License

MIT License
