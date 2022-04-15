var mongoose = require("mongoose");

//Make Mongoose use `findOneAndUpdate()`.
//Eliminates DeprecationWarning for `findOneAndUpdate()` and `findOneAndDelete()`
// mongoose.set('useFindAndModify', false);
var passportLocalMongoose = require("passport-local-mongoose");
var options = {discriminatorKey: 'kind'};

//Create User Schema
var userSchema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    username:String,
    password: String,
    street_address_line1:String,
    street_address_line2:String,
    city:String,
    state:String,
    zip:String,
    email:String,
    phone: String
}, options);

userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", userSchema);

const buyerSchema = new mongoose.Schema({
    credit_score: Number
});
var Buyer = User.discriminator('Buyer', buyerSchema);

const dealerSchema = new mongoose.Schema({
    dealership_name:String,
    main_brand:String,
});
var Dealer = User.discriminator('Dealer', dealerSchema);


//Create Buyer model
module.exports = {User:User, Buyer:Buyer, Dealer:Dealer};