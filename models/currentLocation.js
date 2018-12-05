const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CurrentLocationSchema = new Schema({
    /*email: { type: String, unique: true, lowercase: true},*/
    latitude: Number,
    longitude: Number,
    email: String
});

module.exports = mongoose.model('CurrentLocation', CurrentLocationSchema);