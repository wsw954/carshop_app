var mongoose = require("mongoose");

//Make Mongoose use `findOneAndUpdate()`.
//Eliminates DeprecationWarning for `findOneAndUpdate()` and `findOneAndDelete()`
// mongoose.set('useFindAndModify', false);


const vehicleSchema = new mongoose.Schema({
  creatorID: {
    type:mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "creatorType"
  },
  creatorType:{type: String,
    required: true,
    enum: ["Dealer", "Buyer"]
  },
  make: String,
  model:String,
  year: String,
  msrp: Number,
  details:[String]
});

var Vehicle = mongoose.model('Vehicle', vehicleSchema);




//Export the model
module.exports = {Vehicle:Vehicle};