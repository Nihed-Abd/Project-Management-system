require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();

// Import des routes
const projectsRouter = require("./routes/project.route");
const userRouter = require("./routes/user.route");
const authRouter = require("./routes/auth.route"); // Add new auth router
const categoryRouter = require("./routes/categorie.route");
const reclamationRouter = require("./routes/reclamation.route");
const interviewRouter = require("./routes/interview.route");

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


