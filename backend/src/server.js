import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import sessionsRouter from "./routes/sessions.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" });
});

app.use("/api/sessions", sessionsRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
