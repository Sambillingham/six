var connectionIdObject = {

        "a0a1" : 1,
        "a0a2" : 2,
        "a0a3" : 3,
        "a1a2" : 4,
        "a1a3" : 5,
        "a2a3" : 6

    };

function findConnnectionId (ArduinoOne, ArduinoTwo) {

        var thisArduino = ArduinoOne,
            thisOtherArduino = ArduinoTwo,
            connectionIdThing = "";

            if (thisOtherArduino < thisArduino){

                    var tempStore = thisArduino;

                    thisArduino = thisOtherArduino;
                    thisOtherArduino = tempStore;

            }

            connectionIdThing = "a" + thisArduino + "a" + thisOtherArduino;

            actualConnectionID = connectionIdObject[connectionIdThing] || connectionIdObject[0];

            return actualConnectionID;

}

exports.findConnnectionId = findConnnectionId;