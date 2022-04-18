var express = require("express");
var router  = express.Router();
var passport = require("passport");
LocalStrategy = require("passport-local");
var {Buyer, User} = require("../models/user");
var middleware = require("../middleware");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
// const { check, validationResult } = require('express-validator');



//Login Form
router.get("/buyers/login", function(req, res){
    console.log("Test 15")
    res.render("buyers/login"); 
});

//New Buyer (RESTFul) render new buyer form
router.get("/buyers/new", function(req, res){
    res.render("buyers/new"); 

});

module.exports = router;