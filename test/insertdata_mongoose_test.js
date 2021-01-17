const PostModel = require('../models/blog');
//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/my_emotions';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//check connection
db.once('open', function(){
  console.log('connected to MongoDB');
  var postObj = [
    {emotion: 'happy', number_time_felt: 1},
    {emotion: 'anxious', number_time_felt: 2},
    {emotion: 'sad', number_time_felt: 1},
    {emotion: 'excited', number_time_felt: 0},
    {emotion: 'tired', number_time_felt: 0},
    {emotion: 'average', number_time_felt: 1},
    {emotion: 'angry', number_time_felt: 0},
    {emotion: 'lonely', number_time_felt: 2}
  ];
  //var potatoBag = [{name:'potato1'}, {name:'potato2'}];

  //var Potato = mongoose.model('Potato', PotatoSchema);
  PostModel.collection.insert(postObj, function (err, docs){
      if (err) {
          // TODO: handle error
          console.log('insert data error');
      } else {
          console.info('data were successfully stored.', docs.length);
      }
  });
});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

