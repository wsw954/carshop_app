var express = require('express'),
    methodOverride = require("method-override"),
    app = express(),
    bodyParser = require('body-parser'),
    flash = require('connect-flash');
    mongoose = require('mongoose'),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    {User} = require("./models/user");


//Require routes
var buyerRoutes = require("./routes/buyers"),
    dealerRoutes = require("./routes/dealers"),
    indexRoutes = require("./routes/index"),
    // offerRoutes = require("./routes/offers"),
    requestRoutes = require("./routes/requests"),
    vehicleRoutes = require("./routes/vehicles");

//Connect to local MongoDB Server locally (Or create if it doesn't exist)
mongoose.connect("mongodb://localhost:27017/csdb1"); 


//To enable the use of images & style sheets stored locally, in public folder
app.use(express.static('public'));

app.use(methodOverride("_method"));
// Set Templating Engine
app.set("view engine", "ejs");


//The npm package body-parser is needed anytime using a form and posting data to a req.
app.use(bodyParser.urlencoded({extended:false}));
//parse application/json
app.use(bodyParser.json());
// parse the raw data
app.use(bodyParser.raw());
// parse text
app.use(bodyParser.text());
//To enable flash package, must be done before passport config
app.use(flash());
    
 //Passport Configuration
app.use(require("express-session")({
    secret: "The quick brown fox jumped over the lazy dog",
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  
  //Use middleware to pass the current user info to every route
  app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
  });

  //Apply the routes to the app, should be the last call
app.use("/", buyerRoutes);
app.use("/", dealerRoutes);
app.use("/", indexRoutes);
// app.use("/", offerRoutes);
app.use("/", requestRoutes);
app.use("/", vehicleRoutes);


//Set up listen method for local version
  app.listen(3000, function(){
    console.log("Server csdb1 in port 3000")
});
// To check on local version through Web Browser
// http://localhost:3000 