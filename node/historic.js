ObjectID = require('mongodb').ObjectID;

function createdFrom (date) {

    //This function is used within historicData to create an ObjectID with the specific date, then queries the DB for ObjectID's created after.

    if (typeof(date) == 'string'){
            timestamp = new Date(date);
        }

    hexSeconds = Math.floor(timestamp/1000).toString(16);

    constructedObjectID = ObjectID(hexSeconds+"0000000000000000");

    return constructedObjectID;

}

exports.createdFrom = createdFrom;