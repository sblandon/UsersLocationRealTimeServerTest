const jwt = require('jwt-simple');
const config = require('../config');

function createToken(user) {
    const payload = {
        sub: user._id,        
    }

    return jwt.encode(payload, config.secretToken);
}

function decodeToken(token){
    const decoded = new Promise((resolve, reject) =>{
        try {
            const payload = jwt.decode(token, config.secretToken);
            resolve(payload.sub);
        } catch (err) {
            reject({error: "Invalid token"});
        }
    });

    return decoded;
}

module.exports = {
    createToken,
    decodeToken
}