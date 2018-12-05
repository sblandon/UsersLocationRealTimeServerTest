const User = require('../models/user');
const service = require('../service');
const bcrypt = require('bcryptjs');

function signIn(email, password, callback){
    User.findOne({email: email}, function (err, user) {
        if (err || !user){
            console.log("Invalid/non-existent user")
            callback({noExistsUser: true});
        }        
        else{
            console.log(`Trying to singIn user: ${user}`);

            if(bcrypt.compareSync(password, user.password)){
                console.log("SignIn password match successful");
                let token = service.createToken(user);
                console.log(`Token created: ${token}`);        
                callback({token, success: true, userId: user._id, userEmail: user.email});
            }
            else{
                console.log(`Decode password not match:`)
                callback({err: true});
            }
        }       
            
    });     
}

function signUp(email, password, callback){
    let user = new User();
    user.email = email;
    user.password = password;

    console.log(`New User: ${email} ${password}`);
    console.log(user);

    user.save((err, userStored) => {
        if (err) {
            console.log(`Storing user error: ${err}`);
            callback({err: true});
        }else{
            console.log(`Storing user successful: ${userStored}`);
            let token = service.createToken(userStored);
            console.log(`Token created: ${token}`);        
            callback({token, userId: userStored._id, userEmail: userStored.email});
        }        
    });
}

function isAuth(token, callback){
    service.decodeToken(token)
    .then(response => {
        callback({success: true, userId: response});
    }).catch(response => {
        callback({error: true, message: response.error});
    });
}

module.exports = {
    signIn,
    signUp,
    isAuth
}