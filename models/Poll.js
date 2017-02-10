/**
 * Created by sparsh on 11/8/16.
 */
var mongoose = require("mongoose");
var Schema = require("mongoose/lib/schema.js");

// Define the Poll's structure
var pollSchema = mongoose.Schema({

    // The group id to which the poll belongs
    groupId: {type: Schema.Types.ObjectId, required: true},

    // Poll related specific information
    pollTopic: {type: String, required: true},
    inFavor: {type: Number, required: true},
    opposed: {type: Number, required: true},
    notVoted: {type: Number, required: true},
    ongoing: {type: Boolean, required: true},

    // Timing variables of poll
    submittedAt: {type: Date, required: true},
    stipulatedTime: {type: Number, required: true},
    modifiedAt:{type:Date, required:true},

    // Voter Id's and results
    voters: {type: Array},
    result: {type: String},

    // Timer task for the poll
    scheduledTask : {type : Schema.Types.Object}
});

var Poll = mongoose.model("Poll", pollSchema);
module.exports = Poll;