
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("myemotions");


    var postObj = [
        { emotion: 'happy', number_time_felt: 1 },
        { emotion: 'anxious', number_time_felt: 2 },
        { emotion: 'sad', number_time_felt: 1 },
        { emotion: 'excited', number_time_felt: 0 },
        { emotion: 'tired', number_time_felt: 0 },
        { emotion: 'average', number_time_felt: 1 },
        { emotion: 'angry', number_time_felt: 0 },
        { emotion: 'lonely', number_time_felt: 2 }
    ];

    //save multiple documents to the collection referenced by Book Model
    dbo.collection("postdata").insertMany(postObj, function (err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
    });
});