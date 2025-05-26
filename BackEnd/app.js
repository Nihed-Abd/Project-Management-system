require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const path = require('path');

const app = express();

// Import des routes
const projectsRouter = require("./routes/project.route");
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route"); // Add new auth router
const categoryRouter = require("./routes/categorie.route");
const reclamationRouter = require("./routes/reclamation.route");
const interviewRouter = require("./routes/interview.route");
const uploadRouter = require("./routes/upload.route"); // Add upload router
const publicRouter = require("./routes/public.route"); // Public routes without auth
const messageRouter = require("./routes/message.route"); // Contact messages router
const responseRouter = require("./routes/response.route"); // Reclamation responses router
const chatbotRouter = require("./routes/chatbot.route"); // Chatbot with Gemini AI
const mapRouter = require("./routes/map.route"); // Map with 3D building and project locations

// Middleware globaux
// Configure CORS for frontend communication
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

// Routes principales
app.use("/api/projects", projectsRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter); // Register auth routes
app.use("/api/categories", categoryRouter);
app.use("/api/reclamations", reclamationRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/upload", uploadRouter); // Register upload routes
app.use("/api/public", publicRouter); // Register public routes without auth
app.use("/api/messages", messageRouter); // Register contact messages routes
app.use("/api/responses", responseRouter); // Register reclamation responses routes
app.use("/api/chatbot", chatbotRouter); // Register chatbot routes
app.use("/api/map", mapRouter); // Register map routes

// Route test
app.get("/", (req, res) => {
  res.send("Welcome To HEC (Hammemi Electricity Concept)!");
});

// Middleware d'erreur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Lancer le serveur sur port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
});

module.exports = app;


