// projects will be classed into categories 
// categories are the date of projects 

const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    }
});

module.exports = mongoose.model('Category', categorySchema);