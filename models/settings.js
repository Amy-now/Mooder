var mongoose = require("mongoose");

var settingsSchema = new mongoose.Schema({

    userId: {type: String}, 
    name: {type: String}, 
    happy: {type: String}, 
    sad: {type: String}, 
    anxious: {type: String},
    excited: {type: String}, 
    tired: {type: String}, 
    average: {type: String}, 
    angry: {type: String}, 
    lonely: {type: String},


});




module.exports = mongoose.model("Settings", settingsSchema);
