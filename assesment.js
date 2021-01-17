const mongoose = require("mongoose");

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT;
const bcrypt = require('bcryptjs');
const passport = require('passport');




const { forwardAuthenticated } = require('./config/auth');
const { ensureAuthenticated } = require('./config/auth');

const flash = require('connect-flash');
const session = require('express-session');

const chartsRouter = require('./routes/charts');


mongoose.connect("mongodb+srv://mooder:SW2011x1x5@mooder.zeku3.mongodb.net/mooder?retryWrites=true&w=majority", { useNewUrlParser: true });
mongoose.connection.on("error", (err) => {
  console.error(err);
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running."
  );
  process.exit();
});

const User = require("./models/user");
const Settings = require("./models/settings");
const Mood = require("./models/moods");
const { remove } = require("./models/user");

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);


// Passport middleware
require('./config/passport')(passport);

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//populate database with sample data
//new User({username: "Bob50805", email: "Bob@ibm.com", password: "1234"}).save();
//new User({username: "Amy50805", email: "Amy@ibm.com", password: "Apples"}).save();
//new User({username: "Sid50805", email: "Sid@ibm.com", password: "1234"}).save(); 

//new Settings({ userId: "5ff4793e43ecf0601017072d", happy: "rgb(255, 85, 0)",  anxious: "rgb(100, 115, 2)", sad: "rgb(215, 205, 5)",  excited: "rgb(155, 15, 2)", tired: "rgb(5, 215, 2)", average: "rgb(145, 115, 2)", angry: "rgb(155, 222, 100)", lonely: "rgb(100, 100, 100)"}).save();


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/img", express.static(path.join(__dirname, "public/img")));
app.use('/', chartsRouter);



// Start using Passport 
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded ({extended:false}));  

app.get("/", forwardAuthenticated, async (req, res) => {
    res.render("index"); //{user: foundUser});
});

app.get("/signin",  forwardAuthenticated, async (req, res) => {
  //res.send(__dirname + "\\views")
  res.render("signin");
});

app.get("/signup", forwardAuthenticated, async (req, res) => {
  //res.send(__dirname + "\\views")
  res.render("signup");
});

app.get("/signout", (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect("signin");
});

app.post("/signup", async (req, res) => {
  console.log(req.body);
  console.log("Route Sign up Reached");
  
  const { username, email, password, password2 } = req.body;


  let errors = [];

  if (!username || !email || !password || !password2) 
    {
    errors.push({ msg: 'Some fields are missing' });
    }

  if (password != password2) 
    {
    errors.push({ msg: 'Your Passwords do not match' });
    }

  if (password.length < 6) 
    {
    errors.push({ msg: 'Password must be at least 6 characters' });
    }

  if (errors.length > 0) 
    {
    res.render("signup", {
      errors,
      username,
      email,
      password,
      password2 });
   }  else 
  
  {
    
  User.findOne({ email: email }).then(user => 
      {
      if (user) 
        {
        errors.push({ msg: 'Email already exists' });
          res.render('signup', {
            errors,
            username,
            email,
            password,
            password2 });
        } 
        else 
        {
                  //Defaults for new users 
                  const happy	="#FF0";
                  const anxious	="#109618"; 
                  const sad		="#0011ff";
                  const excited	="#FF00F7";  
                  const tired	="#00FDFF";
                  const average	="#FF9900"; 
                  const angry	="#FF0000";
                  const lonely	="#6200ff"; 

       const newUser = new User({
        username,
        email,
        password,
        happy,	
        anxious,	
        sad,		
        excited,	
        tired,	
        average,	
        angry,	
        lonely	
		
        });   

        bcrypt.genSalt(10, (err, salt) => 
        {
        bcrypt.hash(newUser.password, salt, (err, hash) => 
          {
              if (err) throw err;
              newUser.password = hash;
              newUser
              .save()
              .then(user => 
                  {
                    req.flash ( 'success_msg', 'You are now registered and can log in');
                    res.redirect('/signin');
                  })
              .catch(err => console.log(err));
          });
        });
        }
      });
  }


});  

app.post("/signin", async (req, res, next) => {
  console.log(req.body);  
  passport.authenticate('local', {
    successRedirect: "/homepage",
    failureRedirect: "/signin",
    failureFlash: true
  })(req, res, next);
}); 

app.get("/homepage", ensureAuthenticated, async (req, res) => {
  //res.send(__dirname + "\\views")
   res.render("homepage", {username: req.user.username})
});

app.get("/changedcolour", ensureAuthenticated, async (req, res) => {
  //res.send(__dirname + "\\views")
   res.render("changedcolour", {username: req.user.username})
});

app.get("/settings", async (req, res) => {
  //foundUser = await User.findOne({name: "Amy"});
  //console.log(foundUser);
  //res.send(__dirname + "\\views")
  foundSettings = await User.findOne ({_id: req.user._id });
  console.log(foundSettings);
  res.render("settings", {settings: foundSettings});
});


app.get("/log", async (req, res) => {
  //res.send(__dirname + "\\views")
  foundLog = await User.findOne ({_id: req.user._id });
  console.log(foundLog);
  res.render("log", {log: foundLog});
});


app.get("/track", async (req, res) => {

  foundTrack = await User.findOne ({_id: req.user._id });
  console.log(foundTrack);
  res.render("track", {settings: foundTrack});
});


app.get("/deletepage", async (req, res) => {
  await User.deleteOne ({email: req.user.email });
  console.log("user deleted");
  res.render("deletepage");
});

app.get("/updateemailpage", async (req, res) => {
  //res.send(__dirname + "\\views")
  res.render("updateemailpage");
});

app.post("/updateemailpage", async (req, res) => {
  //res.send(__dirname + "\\views")

 const { oldEmail, newEmail, newEmail2 } = req.body;

  let errors = [];

  if (!oldEmail || !newEmail || !newEmail2) 
    {
    errors.push({ msg: 'Some fields are missing' });
    }

  if (newEmail != newEmail2) 
    {
    errors.push({ msg: 'Your emails do not match' });
    }


  if (errors.length > 0) 
    {
    res.render("updateemailpage", {
      errors,
      oldEmail,
      newEmail,
      newEmail2 });
   }   
   else
   {

        const query   = { "email": oldEmail };
        const update  = { "email": newEmail };
        const options = { "upsert": false };
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }
   res.render("settings");
}); 




app.post("/settings", async (req, res) => {
  // res.send(__dirname + "\\views")

  const { happyButton, newHappyButton } = req.body;
  const { anxiousButton, newAnxiousButton, } = req.body;
  const { sadButton, newSadButton, } = req.body;
  const { excitedButton, newExcitedButton, } = req.body;
  const { tiredButton, newTiredButton, } = req.body;
  const { averageButton, newAverageButton, } = req.body;
  const { angryButton, newAngryButton, } = req.body;
  const { lonelyButton, newLonelyButton, } = req.body;

 happyButton.value
 anxiousButton.value
 sadButton.value
 excitedButton.value
 tiredButton.value
 averageButton.value
 angryButton.value
 lonelyButton.value



  let errors = [];

  if (errors.length > 0) 
    {
    res.render("settings", {
      happyButton});
      // , sadButton, excitedButton, tiredButton, newTiredButton, averageButton, newAverageButton, angryButton, newAngryButton
   }   
   else
   {
     // "sad": sadButton, "excited": excitedButton, "tired": tiredButton, "average" : averageButton, "angry": angryButton
    //  "sad": newSadButton, "excited": newExcitedButton, "tired": newTiredButton, "average" : newAverageButton, "angry": newAngryButton

        const query   = { "happy": happyButton, };
        const update  = { "happy": newHappyButton};
        const options = { "upsert": false };

        
  
        User.updateMany(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
          res.render("changedcolour");
    }





    if (errors.length > 0) 
    {
    res.render("settings", {
       anxiousButton});

   }   
   else
   {

        const query   = { "anxious": anxiousButton,};
        const update  = { "anxious": newAnxiousButton, };
        const options = { "upsert": false };

        
  
        User.updateMany(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
          res.render("changedcolour");
    }


    if (errors.length > 0) 
    {
    res.render("settings", {
      sadButton});
   }   
   else
   {
        const query   = { "sad": sadButton,};
        const update  = { "sad": newSadButton, };
        const options = { "upsert": false };

        
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }




    if (errors.length > 0) 
    {
    res.render("settings", {
      excitedButton});
      // , excitedButton, tiredButton, newTiredButton, averageButton, newAverageButton, angryButton, newAngryButton
   }   
   else
   {


        const query   = { "excited": excitedButton,};
        const update  = { "excited": newExcitedButton, };
        const options = { "upsert": false };

        
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }



    if (errors.length > 0) 
    {
    res.render("settings", {
      tiredButton});
      // , excitedButton, tiredButton, newTiredButton, averageButton, newAverageButton, angryButton, newAngryButton
   }   
   else
   {


        const query   = { "tired": tiredButton,};
        const update  = { "tired": newTiredButton, };
        const options = { "upsert": false };

        
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }


    if (errors.length > 0) 
    {
    res.render("settings", {
      averageButton});
   }   
   else
   {


        const query   = { "average": averageButton,};
        const update  = { "average": newAverageButton, };
        const options = { "upsert": false };

        
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }



    if (errors.length > 0) 
    {
    res.render("settings", {
      angryButton});
   }   
   else
   {


        const query   = { "angry": angryButton,};
        const update  = { "angry": newAngryButton, };
        const options = { "upsert": false };

        
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }

    if (errors.length > 0) 
    {
    res.render("settings", {
      lonelyButton});
   }   
   else
   {


        const query   = { "lonely": lonelyButton,};
        const update  = { "lonely": newLonelyButton, };
        const options = { "upsert": false };

        
  
        User.updateOne(query, update, options)
          .then(result => {
           const { matchedCount, modifiedCount } = result;
           if(matchedCount && modifiedCount) {
             console.log(`Successfully added a new review.`)
            }
         })
          .catch(err => console.error(`Failed to add review: ${err}`))
    }



   res.render("settings");
}); 

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});




