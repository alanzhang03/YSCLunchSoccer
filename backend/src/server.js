import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import sessionsRouter from "./routes/sessions.js";
import authRouter from "./routes/auth.js";
import messagesRouter from "./routes/messages.js";
import { sessionGenerator } from "./utils/sessionGenerator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  /^https:\/\/.*\.vercel\.app$/,
  process.env.PRODUCTION_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowedOrigin) => {
        if (typeof allowedOrigin === "string") {
          return origin === allowedOrigin;
        }
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
app.use("/api/messages", messagesRouter);

sessionGenerator().catch((error) => {
  console.log(error);
});

cron.schedule("0 0 * * 5", async () => {
  console.log("🔄 Running scheduled session generation...");
  await sessionGenerator();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("📅 Session generation scheduled for every Friday at midnight");
});
