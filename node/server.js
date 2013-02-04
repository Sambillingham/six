var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
    relationships = '';
    gpsLatData = [];
    gpsLongData = [];
    Db = require('mongodb').Db,
    socketsPort = 8080,
    mqttPort = 8085,
    serverAddress = "127.0.0.1",
    proximityThreshold = 0.0003, // Equal to 20m
    NumOfClients = 4;


var testDB='',
    defaultTopic = '/default',
    defaultPayload = "I'm a payload",
    topicId = '',
    payloadDataType = '',
    people = [
        {
            id: 0,
            gpsLat: "50.0103",
            gpsLong: "50.0293",
            randomNum: "-287"
        },
        {
            id: 1,
            gpsLat: "50.0023",
            gpsLong: "50.0999",
            randomNum: "-237"
        },
        {
            id: 2,
            gpsLat: "50.0023",
            gpsLong: "50.0433",
            randomNum: "-227"
        },
        {
            id: 3,
            gpsLat: "50.0345",
            gpsLong: "50.1234",
            randomNum: "-187"
        }

    ];
    connections = [
                {
                    a0: 0,
                    a1: 0,
                    a2: 0,
                    a3: 0
                },
                {
                    a0: 0,
                    a1: 0,
                    a2: 0,
                    a3: 0
                },

                {
                    a0: 0,
                    a1: 0,
                    a2: 0,
                    a3: 0
                },

                {
                    a0: 0,
                    a1: 0,
                    a2: 0,
                    a3: 0
                }


    ],
    connectionIdObject = {

        "a0a1" : 1,
        "a0a2" : 2,
        "a0a3" : 3,
        "a1a2" : 4,
        "a1a3" : 5,
        "a2a3" : 6
    };
    

// Connect to the db

console.log('Connecting you to the grid.. Please wait..');

Db.connect("mongodb://localhost:27017/test", function(err, db) {

  if(!err){

  }
  
  console.log('You have joined the grid.');

    // Can you make it dynamically create this if it does not already exist and then call it?
   // relationships =  db.collection('Relationships');

        console.log('The grid has a collection.');

});

//Mongo end

server.listen(socketsPort);

app.configure(function() {

  app.use(express.static(__dirname + '/public'));

});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

            // Sockets Server
            
            io.sockets.on('connection', function (socket) {

                    (function () {

                        socket.emit("persononedata", people[0]);

                        socket.emit("persontwodata", people[1]);

                        //publishClient('2/buzz', '600');
                        

                        setTimeout(arguments.callee, 1000);

                    })();

              });

            // END sockets Server

// MQTT Server

var thisMqttServer = mqtt.createServer(function(client) {

    var self = this;

    if (self.clients === undefined) self.clients = {};



    client.on('connect', function (packet) {

            console.log('we have a connection', packet);

            client.connack({

                returnCode: 0

            });
            client.id = packet.client;

            self.clients[client.id] = client;

    });

    client.on('publish', function (packet) {

        console.log('this is a pub packet: ', packet);

        for (var k in self.clients) {

            self.clients[k].publish({topic: packet.topic, payload: packet.payload});

                    var topicRemoveSlash = packet.topic.split("/");
                        whichAttribute =  topicRemoveSlash[1],
                        aID = (topicRemoveSlash[0]) ;


                    if ( topicRemoveSlash[1] !== "buzz" ){

                            people[aID][topicRemoveSlash[1]] = packet.payload;
                            proximityCheck(aID);

                    }


                    if (packet.topic == 'GPSLONG') {
              
                            console.log('______ dbTestSend _____', packet.payload);

                            dbTestSendVal = packet.payload;

                            gpsLongData = dbTestSendVal.split(',');
                            var ArdID = parseInt(gpsLongData[0]);

                            console.log('Arduino ID' + ArdID)

                            relationships.find({ID: {$in:[ArdID]}}).toArray(function(err, doc) {

                                if(err){

                                    console.log('The grid did not like that.')

                                }

                            console.log(doc)
                            });        
                    }

        };
    });


    client.on('subscribe', function (packet) {

        var granted = [];

        for (var i = 0; i < packet.subscriptions.length; i++) {

                 granted.push(packet.subscriptions[i].qos);

        }

        client.suback({ granted: granted });

    });

    client.on('pingreq', function (packet) {

        client.pingresp();

    });

    client.on('disconnect', function (packet) {

        client.stream.end();

    });

    client.on('close', function (err) {

        delete self.clients[client.id];

    });

    client.on('error', function (err) {

        client.stream.end();
        
        util.log('error!');

    });

      


}).listen(mqttPort);


// END mqtt Server

console.log("MQTT Server: ", thisMqttServer); 
console.log("----------------------------"); 

var thisMqttClient = mqtt.createClient( mqttPort, serverAddress, function (err, client) {
        var defaultTopic;
  
      if (err) {

                console.log(err);
                console.log(" CLIENT = Unable to connect to broker");
                process.exit(1);
      }


        client.connect({

                 client: "buzz"

        });

        client.on('connack', function (packet) {

            if (packet.returnCode === 0) {

                    client.publish({

                            topic: defaultTopic,

                            payload: defaultPayload
                        
                    });

            } else {

                    console.log('connack error %d', packet.returnCode);

                    process.exit(-1);

            }
        });

        client.on('close', function () {

                process.exit(0);

        });

        client.on('error', function (e) {

                console.log('error %s', e);

                process.exit(-1);

        });
});

function publishClient ( topicName , payloadInfo ) {

        thisMqttClient.publish( {

                topic: topicName,
                
                payload: payloadInfo


        });
}

function proximityCheck (id) {

    var thisGpsLat = people[id].gpsLat,
        thisGpsLong = people[id].gpsLong,
        thisId = people[id].id;
        proximityLong = '',
        proximityLat = '';

    for (var i = 0, j = people.length; i < j; i++) {

            secondaryArduino = i ;

            proximityLat = Math.abs(thisGpsLat - people[i].gpsLat );
            proximityLong = Math.abs(thisGpsLong - people[i].gpsLong );

           // console.log( "The varible loop is ", i , " and the id number is ", thisId);

            if ( i !== thisId ){

                    if ( proximityLat <= proximityThreshold && proximityLong <= proximityThreshold ) {

                            console.log("Person ", thisId, " is near to person ", i ) ;

                            increaseConnection(thisId,i);
                    }
            } else {

                console.log('The Loop was equal to the id number, would make faulse result');

            }

    }

}

function increaseConnection ( primary, secondary ){

        var thisPrimary = primary,
            thisSecondary = secondary,
            arraySecondary = "a" + secondary,
            connectionID = "",
            tempStore = "";

            if (secondary < primary ){

                    thisPrimary = secondary;
                    arraySecondary = "a" + primary;
                    thisSecondary = primary;

            }

            connections[thisPrimary][arraySecondary] += 1;

            connectionID = findConnnectionId( thisPrimary, thisSecondary);

            console.log("Connection ID ", connectionID);

            updateConnectionDbEntry(connectionID, thisPrimary, thisSecondary, connections[thisPrimary][arraySecondary] );

}

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

function updateConnectionDbEntry ( connectionID , arduinoOne, arduinoTwo , relationship ){


         //UPDATE the entry to the Database with these paramaters
         console.log("Example entry", "ID: ", connectionID, "Arduino One: ",  arduinoOne, "Arduino Two: ", arduinoTwo, "Relationship: ", relationship);

}

function updateUserMax (id , newMax) {

        // USERS
        // DB query to update a users max connections to the new value
}

function addRelationshipChange ( connectionID , relationship) {

        // RELATIONSHIP CHANGE
        // DB query to Add another entry with the relevant connection ID and the change to the relationship

}

function returnCurrentRelationship (connectionID) {

        // USERS
        //ADD DB query here to return latest relationship for the requested connectionID

        var relationshipQuery = 0;

        return relationshipQuery;
}

function returnCurrentUserMax ( id ) {

        var thisid = id,

            userMax = 0;
        // USERS
        // ADD DB query here to return latest users Max connections

        return userMax;

}








