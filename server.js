const io = require('socket.io')();
const mongoose = require('mongoose');
const config = require('./config');
const authController = require('./controllers/auth');
const locationController = require('./controllers/location');

mongoose.connect(config.mongoDB, (err) => {
    if (err) return console.log(`MongoDB connecting error: ${err}`);
    console.log('MongoDB established connection...')

    io.listen(config.socketIOPort);
    console.log(`UsersLocation service running on port: ${config.socketIOPort}`);
})

io.on('connection', client => {
    console.log("Connected client");

    let clientUserId;
    let clientUserEmail;

    client.on('signIn', async function(data) {
        console.log(`Trying to singIn; email: ${data.email}, password: ${data.password}`);

        authController.signIn(data.email, data.password, function(response){
            if (!response.success){
                
                if(response.noExistsUser){
                    authController.signUp(data.email, data.password, function(response){
                        if (!response.err){
                            clientUserId = response.userId;
                            clientUserEmail = response.userEmail;
                            emitTokken(response.token);
                        }
                    }); 
                }
            }else{
                clientUserId = response.userId;
                clientUserEmail = response.userEmail;
                emitTokken(response.token);
            }
        });

        function emitTokken(token){
            console.log(`Emitting clientUserId: ${clientUserId} token: ${token}`);
            client.emit("logonSuccessful",token);
        }
        
    });    

    
    client.on('updateLocation', data => {
        
        if(!data.token){
            console.log("UpdateLocation without authorization")
            return;
        }

        const token = data.token;

        authController.isAuth(token, function(response){
            if(response.success){
                console.log(`Trying to updateLocation userId: ${response.userId}, email: ${clientUserEmail}, 
                latitude: ${data.latitude} - longitude: ${data.longitude}`);
                locationController.updateLocation(response.userId, data.latitude, data.longitude, clientUserEmail);
                client.broadcast.emit('updateCurrentLocation', {_id: response.userId, email: clientUserEmail, 
                    latitude: data.latitude, longitude: data.longitude});
            }
            else{
                console.log(`UpdateLocation error: ${response.message}`);
            }
        })
        
    });

    client.on('getAllCurrentLocations', data => {

        if(!data.token){
            console.log("GetAllCurrentLocations without authorization")
            return;
        }

        const token = data.token;

        authController.isAuth(token, function(response){
            if(response.success){
                if(clientUserId){
                    locationController.getAllCurrentLocations(clientUserId, function(response){
                        if(response.success){
                            console.log(`CurrentLocations: ${response.currentLocations}`);
                            client.emit('allCurrentLocations',response.currentLocations);
                        }
                    });            
                }
            }
            else{
                console.log(`GetAllCurrentLocations error: ${response.message}`);
            }
        });        
        
    });

    client.on('disconnect', data => {
        console.log("Disconnected user");
        if(clientUserId){
            locationController.deleteLocation(clientUserId);
            client.broadcast.emit('deleteLocation', clientUserId);
        }
    });
});