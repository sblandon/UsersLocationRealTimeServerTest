const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    email: { type: String, unique: true, lowercase: true},
    password: String
});

UserSchema.pre('save',function(next){
    let user = this;
    if (!user.isModified('password'))
        return next();
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        })
    });     
})

module.exports = mongoose.model('User', UserSchema);