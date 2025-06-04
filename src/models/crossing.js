const mongoose = require('mongoose');

const crossingSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    patronymic: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    passportNumber: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: true
    },
    crossingType: {
        type: String,
        enum: ["В'їзд", "Виїзд"],
        required: true
    },
    crossingPoint: {
        type: String,
        required: true
    },
    crossingDate: {
        type: Date,
        default: Date.now
    },
    purpose: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Crossing', crossingSchema);