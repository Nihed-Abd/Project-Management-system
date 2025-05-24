//Register . /register
//*ActivateUserAccount*  : /status/edit
//GetAll : /
//Login : /login


require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// ====== TOKEN HELPERS ======
const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' });
};
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1y' });
};

// ========= REGISTER =========
router.post('/register', async (req, res) => {
    //console.log("Requête de login reçue :", req.body);
    try {
        const { name, email, password, role, isActive } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name || "Default Name",
            email,
            password: hashedPassword,
            role: role || "user",
            isActive: isActive || false
        });

        await newUser.save();

        // Email de vérification
        const mailOptions = {
           // from: process.env.MAIL_USER,
            from : `"Hec Électricité" <noreply@hecelectricite.com>` ,
            to: email,
            subject: 'Activation de votre compte',
            html: `
            <p>Bonjour <strong>${newUser.name}</strong>,</p>
                <p>Merci pour votre inscription chez <strong>HEC Électricité</strong>.</p>
                <p>Nous sommes ravis de vous compter parmi nous.</p>
                <p>Veuillez <a href="http://${req.headers.host}/api/users/status/edit?email=${newUser.email}">cliquer ici</a> pour activer votre compte.</p>
                <br>
                <p>--<br>
                HEC Électricité<br>
                <a href="http://www.hec-electricite.com" target="_blank">www.hec-electricite.com</a><br>
                <a href="mailto:contact@hec.com">contact@hec.com</a></p>

            `
            /*<p>Veuillez <a href="http://${req.headers.host}/api/users/status/edit?email=${newUser.email}">cliquer ici</a> pour activer votre compte.</p>*/

        };

        await transporter.sendMail(mailOptions);
        console.log("✉️ Email de vérification envoyé");

        res.status(201).json({
            success: true,
            message: "Compte créé avec succès. Veuillez vérifier votre email.",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Erreur inscription :", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========= ACTIVER COMPTE =========
router.get('/status/edit', async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

        user.isActive = true;
        await user.save();

        res.status(200).json({ success: true, message: "Compte activé avec succès." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


const rateLimit = require("express-rate-limit");

// Limiter le login : max 5 tentatives toutes les 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5,
    message: "Trop de tentatives. Réessayez plus tard.",
    standardHeaders: true,
    legacyHeaders: false,
});


// ========= LOGIN =========
router.post('/login',loginLimiter , async (req, res) => {
    const { email, password } = req.body;
    let expires = Date.now() + 1;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Champs requis manquants." });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(404).json({ success: false, message: "Compte inexistant." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Mot de passe incorrect." });

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Votre compte est inactif. Veuillez contacter l'administrateur." });
        }

        const { password: _, ...userWithoutPassword } = user._doc;

        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({
            success: true,
            user: userWithoutPassword,
            token,
            refreshToken,
            expiresIn: expires
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ========= LOGIN =========
/*router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    let expires = Date.now() + 1;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Champs requis manquants." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Compte inexistant." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Mot de passe incorrect." });

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Votre compte est inactif. Veuillez contacter l'administrateur." });
        }

        //delete user._doc.password;
        user.findOne({ email }).select("+password");

        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("❌ ACCESS_TOKEN_SECRET est introuvable dans le fichier .env");
            return res.status(500).json({ message: "Erreur serveur. Secret JWT manquant." });
        }
        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({
            success: true,
            user,
            token,
            refreshToken,
            expiresIn: expires
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});*/

// ========= REFRESH TOKEN =========
router.post('/refreshToken', (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Token manquant" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: "Token invalide" });
        }

        const token = generateAccessToken(decoded);
        const newRefreshToken = generateRefreshToken(decoded);

        res.status(200).json({
            success: true,
            token,
            refreshToken: newRefreshToken
        });
    });
});

// ========= GET ALL USERS =========
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========= GET USER BY ID =========
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========= UPDATE USER =========
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const updatedFields = { name, email, role };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, {
            new: true,
            runValidators: true
        }).select("-password");

        if (!updatedUser) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

        res.status(200).json({ success: true, message: "Utilisateur mis à jour.", user: updatedUser });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========= DELETE USER =========
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ success: false, message: "Utilisateur introuvable." });

        res.status(200).json({ success: true, message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;











/*
require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

/*
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'kraig.labadie@ethereal.email',
        pass: '3fgxdQ8KE9qzpsDuyd'
    }
});/

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls:{
        rejectUnauthorized:false
    }
});


const sendEmail = require('../utils/sendEmail'); // adapte le chemin


//Register

router.post('/register', async (req, res, )=> {
    const{name,email,password,role,isActive}=req.body;
    
    const user = await User.findOne({ email })
    if (user) return res.status(404).send({ success: false, message: "User already exists" })

    const salt=await bcrypt.genSalt(10);
    const hash=await bcrypt.hash(password,salt);
    
    const newUser=new User({
      email:email,
      password:hash,
      role:role||"user",
      name:name ||"myname",
      isActive:isActive ||true
      //avatar:avatar||"avatar.jpg"
        });
    
    try {
           await newUser.save();

           // Send verification email
           const mailOption = {
            from: '<aya.benmabrouk0106@gmail.com>',
            to: newUser.email,
            subject: 'Verification of your email',
            html: `<h2>${newUser.name}! Thank you for registering on our website</h2>
            <h4>Please verify your email to proceed...</h4>
            <a
            href="http://${req.headers.host}/api/users/status/edit?email=${newUser.email}"
            >Click here</a>`
        };
        try {
            await transporter.sendMail(mailOption);
            console.log('Verification email sent to your gmail account');
        } catch (error) {

            console.log(error);
        }


           return res.status(201).send({ success: true, message: "Account created successfully", user: newUser })
 
       } catch (error) {
           res.status(409).json({ message: error.message });
       }
  
});
/*
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const activationLink = `http://localhost:5000/api/users/status/edit?email=${encodeURIComponent(email)}`;
    const html = `
      <h2>Bienvenue ${name} !</h2>
      <p>Merci de vous être inscrit. Veuillez <a href="${activationLink}">cliquer ici</a> pour activer votre compte.</p>
    `;

    await sendEmail(email, "Activation de votre compte", html);

    res.status(201).json({ message: "Inscription réussie, vérifiez votre email pour activer le compte." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/*
// Route d'enregistrement
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs obligatoires" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Account already exists !" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        // Envoi de l'e-mail de bienvenue
        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_NAME || 'HEC Électricité'}" <${process.env.MAIL_USER}>`,
            to: email,
            replyTo: process.env.MAIL_USER,
            subject: "Bienvenue chez HEC Électricité",
            text: `Bonjour ${name},\n\nMerci pour votre inscription chez HEC Électricité.\n\n--\nHEC Électricité\nwww.hec-electricite.com\ncontact@hec.com`,
            html: `
                <p>Bonjour <strong>${name}</strong>,</p>
                <p>Merci pour votre inscription chez <strong>HEC Électricité</strong>.</p>
                <p>Nous sommes ravis de vous compter parmi nous.</p>
                <br>
                <p>--<br>
                HEC Électricité<br>
                <a href="http://www.hec-electricite.com" target="_blank">www.hec-electricite.com</a><br>
                <a href="mailto:contact@hec.com">contact@hec.com</a></p>
            `
        });

        console.log("✉️ Email envoyé : %s", info.messageId);

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Erreur register + mail :", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;


/*router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "Account already exists !" });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hash,
            role
            
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully.', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});*/

/*
// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, avatar } = req.body;

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "Account already exists !" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hash,
            role,
            avatar,
            //isActive: false // Set isActive to false by default
        });

        // Save the user to the database
        await newUser.save();

        // Return success response
        res.status(201).json({ success: true, message: 'User registered successfully.', user: newUser });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Activate user account
/*router.get('/status/edit', async (req, res) => {
    try {
        const email = req.query.email;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found !" });
        }

        user.isActive = true;
        await user.save();

        res.json({ success: true, message: "Account activated successfully." });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});
/




// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required !" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Account doesn't exist !" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials !' });
        }

        // Return user data without tokens
        res.status(200).json({
            success: true,
            user,
            //isActive: user.isActive
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update user by ID
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let updatedFields = { name, email, role };

        // If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedFields.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true, runValidators: true }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete user by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


//Activer le compte de l'utilisateur
// Email verification endpoint
router.get('/status/edit', async (req, res) => {
    try {
      const email = req.query.email;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).send({ success: false, message: "User not found" });
      }
  
      user.isActive = true;
      await user.save();
  
      res.send({ success: true, message: "Account activated successfully" });
    } catch (err) {
      return res.status(404).send({ success: false, message: err.message });
    }
  });


module.exports = router;*/