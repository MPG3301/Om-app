import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("om_spiritual.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT DEFAULT 'user',
    plan_type TEXT DEFAULT 'FREE',
    subscription_status TEXT DEFAULT 'inactive',
    razorpay_customer_id TEXT,
    razorpay_subscription_id TEXT,
    expiry_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_disabled BOOLEAN DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS moods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    rating INTEGER,
    note TEXT,
    meditation_duration INTEGER,
    frequency TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    frequency TEXT,
    audio_url TEXT,
    category TEXT,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_type TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial chants if empty
const chantCount = db.prepare("SELECT COUNT(*) as count FROM chants").get() as { count: number };
if (chantCount.count === 0) {
  const insertChant = db.prepare("INSERT INTO chants (title, description, frequency, audio_url, category, is_premium) VALUES (?, ?, ?, ?, ?, ?)");
  insertChant.run("Morning OM", "Start your day with universal vibration.", "432Hz", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "Morning", 0);
  insertChant.run("Deep Sleep Delta", "Enter deep restorative sleep.", "3.5Hz", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "Sleep", 0);
  insertChant.run("Anxiety Release", "Calm your nervous system.", "528Hz", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "Calm", 1);
  insertChant.run("Third Eye Opening", "Enhance intuition and clarity.", "852Hz", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", "Spiritual", 1);
}

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "om-secret-key-108";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API ROUTES ---

// Auth
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
    const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'user' }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, email, name, plan_type: 'FREE' } });
  } catch (err) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan_type: user.plan_type, role: user.role } });
});

// Chants
app.get("/api/chants", authenticate, (req: any, res) => {
  const chants = db.prepare("SELECT * FROM chants").all();
  res.json(chants);
});

// Moods
app.post("/api/moods", authenticate, (req: any, res) => {
  const { rating, note, meditation_duration, frequency } = req.body;
  db.prepare("INSERT INTO moods (user_id, rating, note, meditation_duration, frequency) VALUES (?, ?, ?, ?, ?)")
    .run(req.user.id, rating, note, meditation_duration, frequency);
  res.json({ success: true });
});

app.get("/api/moods/history", authenticate, (req: any, res) => {
  const history = db.prepare("SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 30").all(req.user.id);
  res.json(history);
});

// AI Recommendations
app.get("/api/ai/recommendation", authenticate, async (req: any, res) => {
  const history = db.prepare("SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 7").all(req.user.id) as any[];
  
  if (history.length === 0) {
    return res.json({ recommendation: "Start your journey by logging your first mood. We suggest the 432Hz Morning OM to begin.", advice: "Consistency is key to spiritual growth." });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const historyText = history.map(h => `Rating: ${h.rating}/5, Note: ${h.note}, Duration: ${h.meditation_duration}m, Freq: ${h.frequency}`).join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this meditation and mood history:
${historyText}

Suggest the best OM frequency and type of meditation for tomorrow. Provide calming advice in 3 sentences. Return as JSON with keys: "frequency", "type", "advice".`,
      config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (err) {
    res.json({ frequency: "528Hz", type: "Love & Healing", advice: "Focus on your breath and let go of the day's tension. You are doing great." });
  }
});

// Razorpay Subscriptions
app.post("/api/payments/create-subscription", authenticate, async (req: any, res) => {
  const { planId } = req.body; // e.g., 'plan_monthly' or 'plan_yearly'
  
  // In a real app, you'd create the subscription in Razorpay
  // const subscription = await razorpay.subscriptions.create({
  //   plan_id: planId,
  //   customer_notify: 1,
  //   total_count: 12,
  // });
  
  // Mocking for demo
  const mockSubscription = {
    id: "sub_" + Math.random().toString(36).substr(2, 9),
    status: "created",
    short_url: "https://rzp.io/i/mock_link"
  };

  res.json(mockSubscription);
});

// Webhook (Simplified)
app.post("/api/payments/webhook", (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  // Verify signature here in production
  const event = req.body.event;
  const payload = req.body.payload;

  if (event === "subscription.activated") {
    const subId = payload.subscription.entity.id;
    const email = payload.subscription.entity.notes.email;
    db.prepare("UPDATE users SET plan_type = 'PRO', subscription_status = 'active', razorpay_subscription_id = ? WHERE email = ?")
      .run(subId, email);
  }
  res.json({ status: "ok" });
});

// Admin
app.get("/api/admin/stats", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  const proUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE plan_type = 'PRO'").get() as any;
  const totalMoods = db.prepare("SELECT COUNT(*) as count FROM moods").get() as any;
  const recentUsers = db.prepare("SELECT id, name, email, plan_type, created_at, is_disabled FROM users ORDER BY created_at DESC LIMIT 10").all();
  res.json({ 
    totalUsers: totalUsers.count, 
    proUsers: proUsers.count, 
    totalMoods: totalMoods.count,
    recentUsers
  });
});

app.post("/api/admin/chants", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { title, description, frequency, audio_url, category, is_premium } = req.body;
  db.prepare("INSERT INTO chants (title, description, frequency, audio_url, category, is_premium) VALUES (?, ?, ?, ?, ?, ?)")
    .run(title, description, frequency, audio_url, category, is_premium ? 1 : 0);
  res.json({ success: true });
});

app.post("/api/admin/users/toggle-status", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { userId, is_disabled } = req.body;
  db.prepare("UPDATE users SET is_disabled = ? WHERE id = ?").run(is_disabled ? 1 : 0, userId);
  res.json({ success: true });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OM Spiritual Server running on http://localhost:${PORT}`);
  });
}

startServer();
