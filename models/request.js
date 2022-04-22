var mongoose = require("mongoose");
// mongoose.set('useFindAndModify', false);

//Set discriminator key
var options = {discriminatorKey: 'purchaseType'};

//Create Request Schema
var requestSchema = new mongoose.Schema({
    buyer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Buyer"
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle"
    },
    purchaseType:String, 
    offers:  [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer"
    }],
    status:{
        type: String,
        required: true,
        enum: ["Active", "Accepted","Cancelled"]
      }
}, options);

//Create request model
var Request = mongoose.model('Request', requestSchema);

//Define schema for Cash Purchase
const cashSchema = new mongoose.Schema({
    totalAmount: Number
});
//Add cashSchema to Request model
var Cash = Request.discriminator('Cash', cashSchema);


//Define schema for finance
const financeSchema = new mongoose.Schema({
    downPayment: Number,
    numberOfMonths: Number
});
//Add financeSchema to Request model
var Finance = Request.discriminator('Finance', financeSchema);

//Define schema for lease
const leaseSchema = new mongoose.Schema({
    downPayment: Number,
    leaseTerm: Number,
    annualMileage:Number
});
//Add leaseSchema to Request model
var Lease = Request.discriminator('Lease', leaseSchema);

//Export request model
module.exports = {Request:Request,Cash:Cash, Finance:Finance, Lease:Lease};