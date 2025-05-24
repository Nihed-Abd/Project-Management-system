const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  images: { 
    type: [String],
    default: []
  },
  location: {
    type: {
      lat: { type: Number },
      lng: { type: Number }
    },
    default: null
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Demandé", "Accepteé", "En cours", "terminé"], 
    default: "Demandé" 
  },
  creationDate: { 
    type: Date, 
    default: Date.now 
  },
  LastEditDate: { 
    type: Date, 
    default: Date.now 
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

// Update the LastEditDate whenever a project is updated
ProjectSchema.pre('findOneAndUpdate', function(next) {
  this.set({ LastEditDate: new Date() });
  next();
});

module.exports = mongoose.model("Project", ProjectSchema);





/*const mongoose = require("mongoose");
const categorie =require("./scategorie.js");
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  photo :{

    type: String,

    required: false

},
  description: { type: String, required: true },
 // client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, //client is removed as demanded from hec's admin
  status: { type: String, enum: ["En cours", "Terminé"], default: "en cours" }, //, "Annulé" have been removed car client doesn't exist 
                                                                                // could be added when needed
  //createdAt: { type: Date, default: Date.now },

  scategorieID: {type:mongoose.Schema.Types.ObjectId,
    ref:Scategorie}
});

module.exports = mongoose.model("Project", ProjectSchema);


const mongoose = require("mongoose");
const Scategorie = require("./scategorie.js");
const categorie = require("./categorie.js");

const ProjectSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  photo: { type: String },
  description: { type: String, required: true },
  status: { type: String, enum: ["En cours", "Terminé"], default: "en cours" },

  scategorieID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "scategorie" 
  },

  categorieID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categorie" 
  }
});

module.exports = mongoose.model("Project", ProjectSchema);
*/
