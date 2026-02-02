import express from 'express'
import dotenv from 'dotenv'
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import cors from "cors"

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config();

let app = express()
let port = process.env.PORT || 6000


const allowedOrigins = [
  "http://localhost:5173",
  "https://shop-pilot-admin.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("/*", cors());

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("ShopPilot Backend is running");
});

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/product", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/order", orderRoutes)

connectDb();

app.listen(port, () => {
  console.log("Hello From Server");
});


