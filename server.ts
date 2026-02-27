import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || "https://gemqmiqbhamjcxnjweph.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbXFtaXFiaGFtamN4bmp3ZXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTU2MDIsImV4cCI6MjA4Nzc5MTYwMn0.Oef9Jjkm0qJsY9jSqdFMkOi9EU_Z72EMBgLpJib2uGc";
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set. Using default for development only.");
}
const ACTUAL_JWT_SECRET = JWT_SECRET || "om-secret-key-108";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, ACTUAL_JWT_SECRET);
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
    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword, name }])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign({ id: data.id, email, role: 'user' }, ACTUAL_JWT_SECRET);
    res.json({ token, user: { id: data.id, email, name, plan_type: 'FREE' } });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, ACTUAL_JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, plan_type: user.plan_type, role: user.role } });
});

// Chants
app.get("/api/chants", authenticate, async (req: any, res) => {
  const { data: chants, error } = await supabase
    .from("chants")
    .select("*");
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(chants);
});

// Moods
app.post("/api/moods", authenticate, async (req: any, res) => {
  const { rating, note, meditation_duration, frequency } = req.body;
  const { error } = await supabase
    .from("moods")
    .insert([{ user_id: req.user.id, rating, note, meditation_duration, frequency }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.get("/api/moods/history", authenticate, async (req: any, res) => {
  const { data: history, error } = await supabase
    .from("moods")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return res.status(500).json({ error: error.message });
  res.json(history);
});

// AI Recommendations
app.get("/api/ai/recommendation", authenticate, async (req: any, res) => {
  const { data: history, error } = await supabase
    .from("moods")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(7);
  
  if (error || !history || history.length === 0) {
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
  const { planId } = req.body; 
  
  const mockSubscription = {
    id: "sub_" + Math.random().toString(36).substr(2, 9),
    status: "created",
    short_url: "https://rzp.io/i/mock_link"
  };

  res.json(mockSubscription);
});

// Webhook (Production Ready)
app.post("/api/payments/webhook", async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  // Verify signature
  const isValid = Razorpay.validateWebhookSignature(
    JSON.stringify(req.body),
    signature,
    secret
  );

  if (!isValid) {
    console.warn("Invalid Razorpay webhook signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    if (event === "subscription.activated" || event === "subscription.charged") {
      const subId = payload.subscription.entity.id;
      const email = payload.subscription.entity.notes?.email || payload.payment?.entity?.notes?.email;
      
      if (email) {
        await supabase
          .from("users")
          .update({ 
            plan_type: 'PRO', 
            subscription_status: 'active', 
            razorpay_subscription_id: subId 
          })
          .eq("email", email);
        console.log(`Subscription activated for ${email}`);
      }
    }
    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin
app.get("/api/admin/stats", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  
  const { count: totalUsers } = await supabase.from("users").select("*", { count: 'exact', head: true });
  const { count: proUsers } = await supabase.from("users").select("*", { count: 'exact', head: true }).eq("plan_type", "PRO");
  const { count: totalMoods } = await supabase.from("moods").select("*", { count: 'exact', head: true });
  const { data: recentUsers } = await supabase.from("users").select("id, name, email, plan_type, created_at, is_disabled").order("created_at", { ascending: false }).limit(10);

  res.json({ 
    totalUsers: totalUsers || 0, 
    proUsers: proUsers || 0, 
    totalMoods: totalMoods || 0,
    recentUsers
  });
});

app.post("/api/admin/chants", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { title, description, frequency, audio_url, category, is_premium } = req.body;
  
  const { error } = await supabase
    .from("chants")
    .insert([{ title, description, frequency, audio_url, category, is_premium: is_premium ? true : false }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.post("/api/admin/users/toggle-status", authenticate, async (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { userId, is_disabled } = req.body;
  
  const { error } = await supabase
    .from("users")
    .update({ is_disabled: is_disabled ? true : false })
    .eq("id", userId);

  if (error) return res.status(500).json({ error: error.message });
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
