# ShopPilot Backend

Backend API for **ShopPilot**, an AI-powered e-commerce platform.
Handles authentication, admin authorization, products, orders, users, and cart operations.

## 🛠 Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary

## 🚀 Live Backend
https://shoppilot-backend-i22e.onrender.com

### Core Features
- JWT-based authentication
- Admin authentication via environment variables
- Secure cross-site cookies (SameSite=None, HTTPS)
- MongoDB Atlas integration

## ⚙️ Environment Variables
Create a `.env` file using `.env.example`:

```env
PORT=
MONGO_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
