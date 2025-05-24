// Project Routes
// GET /                    - Get all projects
// POST /                   - Create a new project
// GET /:id                 - Get project by ID
// PUT /:id                 - Update project by ID
// DELETE /:id              - Delete project by ID
// GET /user/:userId        - Get projects by user ID
// GET /category/:categoryId - Get projects by category ID
// GET /status/:status      - Get projects by status

const express = require('express');
const router = express.Router();

const Category = require('../models/categorie');
const Project = require('../models/project');
const User = require('../models/user');

// Create a new project
router.post('/', async (req, res) => {
    try {
        const { title, pictures, description, status, categoryId, userId, location } = req.body;

        // Verify the category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Verify the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the project
        const newProject = new Project({
            title,
            pictures: pictures || [], // Array of image URLs
            description,
            status,
            categoryId,
            userId,
            location, // Add location data if provided
            creationDate: new Date(),
            LastEditDate: new Date()
        });

        await newProject.save();
        res.status(201).json({ 
            success: true,
            message: "Project created successfully", 
            project: newProject 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({}, null, { sort: { 'creationDate': -1 } })
            .populate('categoryId', 'name')
            .populate('userId', 'name email picture');

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get a project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('categoryId', 'name')
            .populate('userId', 'name email picture');

        if (!project) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Update a project by ID
router.put('/:id', async (req, res) => {
    try {
        const { title, pictures, description, status, categoryId, location } = req.body;
        
        // Prepare update object
        const updateData = {
            title,
            description,
            status,
            LastEditDate: new Date()
        };
        
        // Only update pictures if provided
        if (pictures) {
            updateData.pictures = pictures;
        }
        
        // Only update location if provided
        if (location) {
            updateData.location = location;
        };
        
        // Only update categoryId if provided
        if (categoryId) {
            // Verify the category exists
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ 
                    success: false,
                    message: "Category not found" 
                });
            }
            updateData.categoryId = categoryId;
        }
        
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        ).populate('categoryId', 'name')
         .populate('userId', 'name email picture');

        if (!updatedProject) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Project updated successfully', 
            project: updatedProject 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Delete a project by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        
        if (!deletedProject) {
            return res.status(404).json({ 
                success: false,
                message: 'Project not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: "Project deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Get projects by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.params.userId })
            .populate('categoryId', 'name')
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get projects by category ID
router.get('/category/:categoryId', async (req, res) => {
    try {
        const projects = await Project.find({ categoryId: req.params.categoryId })
            .populate('userId', 'name email picture')
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Search projects by user name, email or phone
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        
        // Find users matching the search query
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phoneNumber: { $regex: query, $options: 'i' } }
            ]
        }).select('_id');
        
        const userIds = users.map(user => user._id);
        
        // Find projects associated with those users
        const projects = await Project.find({ userId: { $in: userIds } })
            .populate('categoryId', 'name')
            .populate('userId', 'name email picture phoneNumber')
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get projects by status
router.get('/status/:status', async (req, res) => {
    try {
        const projects = await Project.find({ status: req.params.status })
            .populate('categoryId', 'name')
            .populate('userId', 'name email picture')
            .sort({ creationDate: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


router.get('/scat/name/:nomScategorie', async (req, res) => {
    try {
        // Chercher la scatégorie par son nom
            const nom = req.params.nomScategorie;
    
            // Recherche insensible à la casse avec une regex
            const scategorie = await Scategorie.findOne({
                nomScategorie: { $regex: new RegExp('^' + nom + '$', 'i') }
            });
    
            if (!scategorie) {
                return res.status(404).json({ message: "Sous-catégorie non trouvée" });
            }
    
            const projects = await Project.find({ scategorieID: scategorie._id }).exec();
    
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
});

/*// 👉 Get projects by scategorie ID
router.get('/scat/:scategorieID', async (req, res) => {
    try {
        const projects = await Project.find({ scategorieID: req.params.scategorieID }).exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});*/

// 👉 Get projects by Datecategorie
router.get('/cat/date/:datecategorie', async (req, res) => {
    try {
        // 1. Chercher la catégorie par sa date
        const categorie = await Categorie.findOne({ Datecategorie: req.params.datecategorie }).exec();
        if (!categorie) {
            return res.status(404).json({ message: 'Catégorie non trouvée pour cette date' });
        }

        // 2. Chercher les projets ayant cette catégorie
        const projects = await Project.find({ categorieID: categorie._id })
            .populate({
                path: 'scategorieID',
                select: 'nomScategorie'
            })
            .populate({
                path: 'categorieID',
                select: 'Datecategorie'
            })
            .exec();

        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/*// 👉 Get projects by categorie ID
router.get('/cat/:categorieID', async (req, res) => {
    try {
        const sousCategories = await Scategorie.find({ categorieID: req.params.categorieID }).exec();
        const sousCategorieIDs = sousCategories.map(sc => sc._id);

        const projects = await Project.find({ scategorieID: { $in: sousCategorieIDs } }).exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});*/

// 👉 Filter projects by Datecategorie and nomScategorie
router.get('/filter/:datecategorie/:nomScategorie', async (req, res) => {
    const { datecategorie, nomScategorie } = req.params;

    try {
        const categorie = await Categorie.findOne({ Datecategorie: datecategorie });
        if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });

        const scategorie = await Scategorie.findOne({
            nomScategorie: nomScategorie        });

        if (!scategorie) return res.status(404).json({ message: 'Sous-catégorie non trouvée' });

        const projects = await Project.find({ scategorieID: scategorie._id })
            .populate({
                path: 'scategorieID',
                select: 'nomScategorie categorieID',
                populate: {
                    path: 'categorieID',
                    select: 'Datecategorie'
                }
            });

        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


















/*const express = require('express');
const router = express.Router();

const Scategorie = require("../models/scategorie");
const Categorie = require("../models/categorie");
const Project = require('../models/project');

//  Create a new project
router.post('/', async (req, res) => {
    const newProject = new Project(req.body);
    try {
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//  Get all projects with nomScategorie + Datecategorie
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({}, null, { sort: { '_id': -1 } })
            .populate({
                path: 'scategorieID',
                select: 'nomScategorie categorieID',
                populate: {
                    path: 'categorieID',
                    select: 'Datecategorie'
                }
            })
            .select('title photo description status scategorieID');

        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({
            message: "Erreur serveur",
            details: error.message
        });
    }
});

//  Get a single project by ID
router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate({
                path: 'scategorieID',
                select: 'nomScategorie categorieID',
                populate: {
                    path: 'categorieID',
                    select: 'Datecategorie'
                }
            });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//  Update a project by ID
router.put('/:id', async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const populatedProject = await Project.findById(updated._id)
            .populate({
                path: 'scategorieID',
                select: 'nomScategorie categorieID',
                populate: {
                    path: 'categorieID',
                    select: 'Datecategorie'
                }
            });

        res.status(200).json({ message: 'Project updated successfully', project: populatedProject });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//  Delete a project by ID
router.delete('/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//  Get projects by scategorie ID
router.get('/scat/:scategorieID', async (req, res) => {
    try {
        const projects = await Project.find({ scategorieID: req.params.scategorieID }).exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get projects by categorie ID
router.get('/cat/:categorieID', async (req, res) => {
    try {
        const sousCategories = await Scategorie.find({ categorieID: req.params.categorieID }).exec();
        const sousCategorieIDs = sousCategories.map(sc => sc._id);

        const projects = await Project.find({ scategorieID: { $in: sousCategorieIDs } }).exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

//   filter by Datecategorie and nomScategorie
router.get('/filter/:datecategorie/:nomScategorie', async (req, res) => {
    const { datecategorie, nomScategorie } = req.params;

    try {
        const categorie = await Categorie.findOne({ Datecategorie: datecategorie });
        if (!categorie) return res.status(404).json({ message: 'Catégorie non trouvée' });

        const scategorie = await Scategorie.findOne({
            nomScategorie: nomScategorie,
            categorieID: categorie._id
        });

        if (!scategorie) return res.status(404).json({ message: 'Sous-catégorie non trouvée' });

        const projects = await Project.find({ scategorieID: scategorie._id })
            .populate({
                path: 'scategorieID',
                select: 'nomScategorie categorieID',
                populate: {
                    path: 'categorieID',
                    select: 'Datecategorie'
                }
            });

        res.status(200).json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;*/

































/*
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Scategorie = require("../models/scategorie");
const Project = require('../models/project');

// Create a new project
router.post('/', async (req, res) => {
    const newProject = new Project(req.body);
    try {
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all projects
router.get('/', async (req, res) => {
    try {
      const projects = await Project.find({}, null, { sort: { '_id': -1 } })
        .populate("scategorieID", "nom") // Seulement le champ 'nom' si nécessaire
        .select("title photo description status scategorieID"); // Sélection explicite
      res.status(200).json(projects);
    } catch (error) {
      res.status(400).json({ 
        message: "Erreur serveur",
        details: error.message 
      });
    }
  });
/*router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({}, null, { sort: { '_id': -1 } }).populate("scategorieID").exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//
// Get a single project by ID
router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate("scategorieID").exec();
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a project by ID
router.put('/:id', async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const populatedProject = await Project.findById(updated._id).populate("scategorieID").exec();
        res.status(200).json({ message: 'Project updated successfully', project: populatedProject });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a project by ID
router.delete('/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Project deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get projects by scategorie ID
router.get('/scat/:scategorieID', async (req, res) => {
    try {
        const projects = await Project.find({ scategorieID: req.params.scategorieID }).exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get projects by categorie ID
router.get('/cat/:categorieID', async (req, res) => {
    try {
        const sousCategories = await Scategorie.find({ categorieID: req.params.categorieID }).exec();
        const sousCategorieIDs = sousCategories.map(sc => sc._id);

        const projects = await Project.find({ scategorieID: { $in: sousCategorieIDs } }).exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;










/*const express = require('express');
const router = express.Router();

const Scategorie =require("../models/scategorie");

const Project = require('../models/project');

// Create a new project
router.post('/', async (req, res) => {
    /*try {
        const { title/*, photo, description/*, client, status } = req.body;
        const project = new Project({ title/*, photo, description/*, client, status });
        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
        //

        const newproject = new Project(req.body)
        try {
        await newproject.save();
        res.status(200).json(newproject );
        } catch (error) {
            
        res.status(404).json({ message: error.message });}
        
        
});

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({}, null, {sort: {'_id': - 1}}).populate("scategorieID").exec();
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//
// / Get a single project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});*/

/*// Modified route to find by numeric ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({ id: parseInt(req.params.id) }); // Look for custom 'id' field
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});*/

/*// Updated route to handle BOTH ObjectId and numeric ID
router.get('/:id', async (req, res) => {
    try {
        let project;
        
        // Check if the ID is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            project = await Project.findById(req.params.id);
        } 
        // Otherwise search by numeric ID
        else {
            project = await Project.findOne({ id: parseInt(req.params.id) });
        }

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
//


// Get project By Id
router.get('/:projectId',async(req, res)=>{
    try {
        const art = await Project.findById(req.params.articleId);
        
        res.status(200).json(art);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Update a project
router.put('/:id', async (req, res) => {
    /*try {
        const { title, photo, description, client, status } = req.body;
        const project = await Project.findByIdAndUpdate(req.params.id, { title, photo, description, client, status }, { new: true });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
        //

        try {
            const project = await Project.findByIdAndUpdate(req.params.id,{ $set: req.body },{ new: true });
            const projects = await Project.findById(project._id).populate("scategorieID").exec();
            res.status(200).json({ message: 'Project updated successfully', projects });;
            } catch (error) {
            res.status(404).json({ message: error.message });
            }
});



// Delete a project

/*router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});*/


/*router.delete('/:id', async (req, res)=> {
    const id = req.params.projectId;
    await Project.findByIdAndDelete(id);
    res.json({ message: "project deleted successfully." });
    });
    //

    router.delete('/:id', async (req, res) => {
        try {
          await Project.findByIdAndDelete(req.params.id);
          res.json({ message: "project deleted successfully." });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });
      



    // Get project with scategorieId
router.get('/scat/:scategorieID',async(req, res)=>{
    try {
    const project = await Project.find({ scategorieID: req.params.scategorieID}).exec();
    res.status(200).json(project);
    } catch (error) {
    res.status(404).json({ message: error.message });
    }
    });


    // Get project with categorieId
    router.get('/cat/:categorieID', async (req, res) => {
    try {
        
        // Recherche des sous-catégories correspondant à la catégorie donnée
        const sousCategories = await Scategorie.find({ categorieID: req.params.categorieID }).exec();

        // Initialiser un tableau pour stocker les identifiants des sous-catégories trouvées
        const sousCategorieIDs = sousCategories.map(scategorie => scategorie._id);
        
        // Recherche des projets correspondants aux sous-catégories trouvées
        const projects = await Project.find({ scategorieID: { $in: sousCategorieIDs } }).exec();
        res.status(200).json(projects);
    } 
    catch (error) {
    res.status(404).json({ message: error.message });
    }
    });



module.exports = router;
*/
