var express = require('express');
var router = express.Router();
const PostModel = require('../models/blog');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/my_emotions";
//Import the mongoose module
var mongoose = require('mongoose');


/* GET PieChart. */
router.get('/piechart', function (req, res) {

    MongoClient.connect(url, function (err, db, callback) {
        if (err) throw err;

        var dbo = db.db("myemotions");
        dbo.collection("postdata").find({}).toArray(function (err, result) {
            if (err) throw err;

            console.log('result', result);
            var postData = getPostData(result, ['emotion', 'number_time_felt']);
            console.log('postData', postData);
            var number_time_felt = getNumber_Time_Felt(postData);
            var Emotions = getEmotions(postData);

            console.log('piechart data', number_time_felt);
            res.render('dashboard/piechart', {
                title: 'My First Pie Chart',
                datai: JSON.stringify(number_time_felt),
                labeli: JSON.stringify(Emotions)
            });

            db.close();
        });
    });
});


function getPostData(obj1, obj2) {
    return obj1.map(function (row) {
        var result = {};
        obj2.forEach(function (key) {
            result[key] = row[key];
        });
        return result;
    });
}

function getNumber_Time_Felt(postData) {
    data = [];
    var i = 0;
    postData.forEach(function (content, callback) {
        for (var key in content) {
            //console.log('key: '+key, ', value: '+ content[key]);
            if (key == 'number_time_felt') {
                data[i] = content[key];
            }
        }
        i++;
    });
    return data;
}

function getEmotions(postData) {
    data = [];
    var i = 0;
    postData.forEach(function (content, callback) {
        for (var key in content) {
            //console.log('key: '+key, ', value: '+ content[key]);
            if (key == 'emotion') {
                data[i] = content[key];
            }
        }
        i++;
    });
    return data;
}





function blogPostData(callback) {
    // after some calculation 
    PostModel.find({}, function (err, postData) {
        if (err) {
            console.log(err);
        } else {
            getSomeData(postData, callback);
        }
    });
}

function getSomeData(postData, callback) {

    month_data = [];
    number_of_posts_data = [];
    var i = 0;
    postData.forEach(function (content, callback) {

        for (var key in content) {
            //console.log('key: '+key, ', value: '+ content[key]);
            if (key == 'emotion') {
                month_data[i] = content[key];
            }
            if (key == 'number_time_felt') {
                number_of_posts_data[i] = content[key];
            }
        }
        i++;
    });
    var callBackString = {};
    callBackString.month_data = month_data;
    callBackString.number_of_posts_data = number_of_posts_data
    //return data;
    callback(callBackString);
}



module.exports = router;