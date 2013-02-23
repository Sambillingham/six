var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
    ObjectID = require('mongodb').ObjectID,
    relationships = '';
    changes = '';
    users = '';
    MongoClient = require('mongodb').MongoClient,
    socketsPort = 8080,
    mqttPort = 8085, // need to be diffrent to socketsPort
    serverAddress = "127.0.0.1",
    proximityThreshold = 0.0003, // Equal to 20m
    NumOfClients = 4, // Number of Arduino's for live connection
    delayForConnectionTime = 30000, // time in milleseconds
    timeBetweenDecay = 6000000; // 1 hour between delay


var defaultTopic = '/default',
    defaultPayload = "I'm a payload",
    historicsStuff = [];
    people = [
        {
            id: 0,
            gpsLat: "50.0103",
            gpsLong: "50.0293",
            randomNum: "-287",
            maxCon: 0
        },
        {
            id: 1,
            gpsLat: "50.0023",
            gpsLong: "50.0999",
            randomNum: "-237",
            maxCon: 0
        },
        {
            id: 2,
            gpsLat: "50.0023",
            gpsLong: "50.0433",
            randomNum: "-227",
            maxCon: 0
        },
        {
            id: 3,
            gpsLat: "50.0345",
            gpsLong: "50.1234",
            randomNum: "-187",
            maxCon: 0
        }

    ],
    connectionIdObject = {

        "a0a1" : 1,
        "a0a2" : 2,
        "a0a3" : 3,
        "a1a2" : 4,
        "a1a3" : 5,
        "a2a3" : 6

    },
    
    connectionIdTime = {

        "1" : false,
        "2" : false,
        "3" : false,
        "4" : false,
        "5" : false,
        "6" : false
    },
    UserMaxConnection = [
                {

                    "id" : 0,
                    "max" : 0
                },
                {

                    "id" : 1,
                    "max" : 0
                },
                {

                    "id" : 2,
                    "max" : 0
                },
                {

                    "id" : 3,
                    "max" : 0
                }
    ],
    relationshipsDbInsert = [
                {
                    "conId" : 1,
                    "relationship" : 0
                },
                {
                    "conId" : 2,
                    "relationship" : 0
                },
                {
                    "conId" : 3,
                    "relationship" : 0
                },
                {
                    "conId" : 4,
                    "relationship" : 0
                },
                {
                    "conId" : 5,
                    "relationship" : 0
                },
                {
                    "conId" : 6,
                    "relationship" : 0
                }

    ];

// Mongo connection
MongoClient.connect("mongodb://localhost:27017/six", function(err, db) {

    if(err) {

            console.log(err);
    }

        // Create DB if they dont already Exist
        db.createCollection('Relationships', function(err, collection) {});
        db.createCollection('Users', function(err, collection) {});
        db.createCollection('Changes', function(err, collection) {});
        //END DB Creation

        // Create var for "easier" reference
        relationships =  db.collection('Relationships');
        users = db.collection('Users');
        changes = db.collection('Changes');
        // End var creation

        console.log(' Connected to Mongo Database');

});//MONGO END

server.listen(socketsPort);

app.configure(function() {

        app.use(express.static(__dirname + '/public'));

});

app.get('/', function (req, res) {

        res.sendfile(__dirname + '/index.html');

});

    // Sockets Server
    
    io.sockets.on('connection', function (socket) {



            (function () { // ANONYMOUS SELF CALLING FUNCTION 1.5 SECS

                // FIND USERS IN DB AND EMIT TO SOCKET
                for ( var i = 0 ; i < 4 ; i++){

                        users.findOne( { id: i }, function ( err, item ) {

                                if ( err ) {

                                        console.log('Oh noes an error');

                                } else {
                                        
                                        socket.emit("maxConnection", item);
                                        //console.log(item);

                                }

                        });

                }
                //END USERS DB FIND/EMIT

                // FIND RELATIONSHIPS IN DB AND EMIT TO SOCKET
                for ( var i = 1 ; i <= relationshipsDbInsert.length ; i++) {

                        relationships.findOne( { conId: i }, function ( err, item ) {

                                if ( err ) {

                                        console.log('Oh noes an error');

                                } else {
                                        
                                        socket.emit("relationshipConnections", item);
                                        //console.log(item);

                                }

                        });

                }
                //END RELATIONSHIPS DB FIND/EMIT


                //PUBLISH TO CLIENT
                //publishClient('2/buzz', '600');

                setTimeout(arguments.callee, 1500);

            })(); // END ANONYMOUS FUNCTION

        ////////////////////////////////////////////////////////////////////////////////////////////////
        //Test function that reapeats every 2 seconds;
        (function () {

            //console.log(connectionIdTime);

                // INITIAL INSERT for DB users & relationships Uncomment on deployment
                //users.insert( UserMaxConnection, { w:1 }, function ( err, result ) { } );
                //relationships.insert( relationshipsDbInsert, { w:1 }, function ( err, result ) { } );

                // USE TO UPDATE BY HAND may need at some point
                //relationships.update( { conId:"2" }, {$set:{relationship:0}}, {w:1}, function ( err, result ) {});
                //users.update( {id:1}, {$set:{max:0}}, {w:1}, function ( err, result ) {});


                ///console.log( connectionIdTime,'   Whats LIVE:. ');

                setTimeout(arguments.callee, 5000);

        })();
        //END TEST FUNCTION
        ////////////////////////////////////////////////////////////////////////////////////////////////

            socket.on('all-view-request', function () {

                console.log('REQUEST FOR all view has been recvied');
                //historicsStuff = historicData("2012/7/7");

                relationships.find({ _id: {$gt: createdFrom("2012/7/7")}}).toArray(function (err , docs){

                    var allViewData = JSON.stringify(docs);

                    console.log(allViewData);
                    socket.emit('all-view-data', allViewData);
                    
                });
            });

      });

    // END sockets Server


    

//SELF CALLING FUNCTION FOR DECAY
setTimeout( function () {

       (function () {
                
                decayRelationship();

                setTimeout(arguments.callee, timeBetweenDecay);

        })();
            
}, 10000);  //10 SECONDS before decay starts so db can be setup




// MQTT Server

var thisMqttServer = mqtt.createServer(function(client) {

    var self = this;

    if (self.clients === undefined) self.clients = {};

    client.on('connect', function (packet) {

            console.log(packet.client, ':  - MQTT Client has Connected');

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

                        var topicRemoveSlash = packet.topic.split("/"),
                            whichAttribute =  topicRemoveSlash[1],
                            aID = (topicRemoveSlash[0]);


                        if ( topicRemoveSlash[1] !== "buzz" ){

                                people[aID][topicRemoveSlash[1]] = packet.payload;
                                proximityCheck(aID);

                        }
        }
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

var thisMqttClient = mqtt.createClient( mqttPort, serverAddress, function (err, client) {

        var defaultTopic;

        if(err) {

                console.log(err , " CLIENT = Unable to connect to broker");
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

            if ( i !== thisId ){

                    if ( proximityLat <= proximityThreshold && proximityLong <= proximityThreshold ) {

                            console.log("Person: -", thisId, "- is near to person: -", i ,"-" ) ;

                            increaseConnection(thisId,i);
                    }

            } else {

                    //console.log('The Loop was equal to the id number or was not relevant');
                    //Console.log('.')
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

            connectionID = findConnnectionId( thisPrimary, thisSecondary);
            stringConnectionID = connectionID + '';

             if ( connectionIdTime[stringConnectionID] === false ) {

                    //console.log( connectionIdTime,'   CONECTIONS AVALIBLE:. ');

                            updateUserMax( thisPrimary ,thisSecondary , 1 ); //UPDATE Max Connections

                            console.log ( 'UPDATING USER MAX',thisPrimary, "   ",thisSecondary );

                            updateRelationshipDbEntry( connectionID ); //UPDATE Relationship connection

                    connectionIdTime[stringConnectionID] = true; // BLOCK CONNECTIONS UNTIL TIMER SETS THIS FALSE

                    timeDelayForConnection(stringConnectionID); // RUN FUNCTION FOR THIS CONNECTION ID

            } else {

                console.log('DID NOT UPDATE, TIMER DELAY IS: ', connectionIdTime[stringConnectionID]);

            }
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

function updateRelationshipDbEntry ( connectionID ){

        relationships.update( { conId:connectionID }, { $inc: { relationship:1 } }, {w:1}, function ( err, result ){

                if (err)  {

                        console.log('Update failed', err);

                }

                else  {

                        console.log('incremented'  , connectionID, ' by + 1 ');

                }

        });
         
}

function updateUserMax ( ArduinoOne, ArduinoTwo , incAmmount ) {

        // Incremention both Users Max Connection by Increment

        users.update(  { $or: [ { id: ArduinoOne }, { id: ArduinoTwo } ] } , { $inc: { max:incAmmount } }, { multi:true }, function ( err, result ){

                if (err)  {

                        console.log('Update failed', err );

                }

                else  {

                        console.log('incremented MAX Connection by + 1' );

                }

        });

}

function addRelationshipChange ( connectionID , relationship ) {

       // Inserts a new document with the ID and change into changes collection.
        // changes.insert({ID:connectionID,rChange:relationship}, function(err){
        //     if(err) console.log('Inserting change failed.')
        //     else console.log('Inserted change' + connectionID + " : " + relationship)
        // })

}

function decayRelationship () {

        users.update( { id: { $gte: 0, $lte: 3 } } , { $inc: { max: -1 } }, { multi:true }, function ( err, result ){

                if (err)  {

                        console.log('Update failed', err );

                }

                else  {

                        console.log('ALL MAX CONECTIONS DECREASED BY ONE' );

                }

        });

        relationships.update( { conId: { $gte: 1, $lte: 6 } } , { $inc: { relationship: -1 } }, { multi:true }, function ( err, result ){

                if (err)  {

                        console.log('Update failed', err );

                }

                else  {

                        console.log('ALL RELATIONSSHIP CONECTIONS DECREASED BY ONE');

                }

        } );

}

function timeDelayForConnection ( connectionID ) {

        setTimeout( function () {

                connectionIdTime[connectionID] = false ;

        }, delayForConnectionTime );
}

// function historicData (date) {

//     //This gives you an array of the objects.

//     relationships.find({ _id: {$gt: createdFrom(date)}}).toArray(function (err , docs){
    
//         //console.log(docs);
//         return docs;
    
//     });
    
// }

function createdFrom (date) {

    //This function is used within historicData to create an ObjectID with the specific date, then queries the DB for ObjectID's created after.

    if (typeof(date) == 'string'){
            timestamp = new Date(date);
        }

    hexSeconds = Math.floor(timestamp/1000).toString(16);

    constructedObjectID = ObjectID(hexSeconds+"0000000000000000");

    return constructedObjectID;

    }

