var express = require("express");
var router  = express.Router();
var passport = require("passport");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false })
// const { check, validationResult } = require('express-validator');


//Root route
  router.get("/", function(req, res){
        res.render("landings");
    });







  module.exports = router;