const mongoose = require('mongoose');
const { updateMany } = require('./Check');

const reportSchema = new mongoose.Schema({
    checkId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Check',
    },
    status:{
        type: String,
        required: true,
        enum: ['up', 'down'],
    },
    statusCode:{
        type:Number,
    },
    responseTime:{
        type:Number,
    },
    Timestamp:{
        type:Date,
        required: true,
        default: Date.now,
    },
})
reportSchema.index({ checkId: 1, timestamp: -1 });
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;