# Committee Manager

Committee Manager is a web-based platform to manage financial groups or committees (also known as chit funds). It helps admins manage member data, collections, and rotations, while providing a public view-only portal for members without requiring login.

## Features

- Admin dashboard to manage multiple committees
- Member data entry and secure storage
- Track payments, distributions, and collection cycles
- Public portal to view committee info (no login required)
- Secure admin routes protected with authentication
- Responsive and user-friendly UI

## Tech Stack

| Layer     | Technology            |
|-----------|------------------------|
| Frontend  | HTML, CSS, JavaScript, EJS |
| Backend   | Node.js, Express.js    |
| Database  | MongoDB with Mongoose  |
| Icons     | Font Awesome           |
| Deployment| (Add: Render / Vercel / Railway etc.) |

## Project Structure

project-root/
├── views/ # EJS templates
├── public/ # Static files (CSS, images)
│ ├── css/
│ └── images/
├── routes/ # Express route handlers
├── controllers/ # Logic for handling requests
├── models/ # Mongoose schemas
├── app.js # Main server entry point
├── .env # Environment variables
└── README.md # Project documentation

bash
Copy
Edit




## Setup Instructions

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/committee-manager.git
   cd committee-manager
npm install

MONGO_URI=your_mongo_connection_string
PORT=3000
SESSION_SECRET=your_session_secret


http://localhost:3000
