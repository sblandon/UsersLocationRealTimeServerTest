const CurrentLocation = require('../models/currentLocation');

function updateLocation(id, latitude, longitude, email){


    update = { latitude: latitude,  longitude: longitude},
    options = { upsert: false };

    // Find the document
    CurrentLocation.findOneAndUpdate({_id: id}, update, options, function(error, currentLocation) {
        if (!error) {
            // If the document doesn't exist
            if (!currentLocation) {
                // Create it
                currentLocation = new CurrentLocation();
                currentLocation._id = id;
                currentLocation.latitude = latitude;
                currentLocation.longitude = longitude;
                currentLocation.email = email;

                console.log(`------------- Storing new current location\n${currentLocation}`);

                currentLocation.save((err, currentLocationStored) => {
                    if (err) {
                        console.log(`Storing currentLocation error: ${err}`);
                    }else{
                        console.log(`Storing currentLocation successful: ${currentLocationStored}`);
                    }        
                });
            }            
        }
        else{
            console.log(`CurrentLocation findAndUpdate error: ${error}`);
        }
    });
}

function deleteLocation(id){
    CurrentLocation.findByIdAndDelete(id,(err, currentLocation)=>{
        if(!err){
            console.log(`CurrentLocation from userId: ${id} was deleted`);
        }
        else{
            console.log(`Delete currentLocation error: ${err}`);
        }
    })
}

function getAllCurrentLocations(id, callback){
    CurrentLocation.find({ _id: { $ne: id } }, (err, currentLocations)=> {
        if(err){
            console.log(`GetAllCurrentLocations err: ${err}`);
            callback({error: true, message: err});
        }
        else{
            callback({success: true, currentLocations});
        }
    });
}

module.exports = {
    updateLocation,
    deleteLocation,
    getAllCurrentLocations
}