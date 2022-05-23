var mongoose = require("mongoose");
// mongoose.set('useFindAndModify', false);

//Create Offer Schema
var offerSchema = new mongoose.Schema({
    dealer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dealer"
    },
    dealerVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle"
    },
    request:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request"
    },
    monthlyPayment:Number,
    totalPayment:Number,
    status:{
        type: String,
        required: true,
        enum: ["Active","Offer Accepted", "Closed", "Request Cancelled"]
      }
});

//Create Offer model
var Offer = mongoose.model('Offer', offerSchema);

//Export Offer model
module.exports = {Offer:Offer};