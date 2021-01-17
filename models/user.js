var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({

    username: {type: String}, 
    email: {type: String},
    password: {type: String},
    happy: {type: String},
    anxious: {type: String}, 
    sad: {type: String},
    excited: {type: String},  
    tired: {type: String},
    average: {type: String}, 
    angry: {type: String},
    lonely: {type: String}, 



}); 




module.exports = mongoose.model("User", userSchema);

