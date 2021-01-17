var mongoose = require("mongoose");

var moodSchema = new mongoose.Schema({

    date: {type: Date},
    happyText: {type: String}, 
    anxiousText: {type: String},
    sadText: {type: String},
    excitedText: {type: String},
    tiredText: {type: String}, 
    averageText: {type: String},
    angryText: {type: String},  
    lonelyText: {type: String}, 

});