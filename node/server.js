var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
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

    //Home made modules
    var historic = require("./historic"),
    repeatconnection = require("./repeatconnection"),
    mqqtclient = require("./mqqtclient"),
    findconid = require("./findconid");

    //

var historicsStuff = [],
    people = [
        {
            id: 0,
            gpsLat: "50.0103",
            gpsLong: "50.0293"
        },
        {
            id: 1,
            gpsLat: "50.0023",
            gpsLong: "50.0999"
        },
        {
            id: 2,
            gpsLat: "50.0023",
            gpsLong: "50.0433"
        },
        {
            id: 3,
            gpsLat: "50.0345",
            gpsLong: "50.1234"
        }

    ],
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

    ],
    latestTopic = '';

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

        //users.insert( UserMaxConnection, { w:1 }, function ( err, result ) { } );
                 
        //relationships.insert( relationshipsDbInsert, { w:1 }, function ( err, result ) { } );

        console.log('Connected to Mongo Database');

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
                //mqqtclient.publishOnClient('1/buzz', '3');


                //show latestest topic to socket
                socket.emit('testingTopic', latestTopic);

                setTimeout(arguments.callee, 1500);

            })(); // END ANONYMOUS FUNCTION


            socket.on('all-view-request', function () {

                console.log('REQUEST FOR all view has been recvied');
                //historicsStuff = historicData("2012/7/7");

                users.find({ _id: {$gt: historic.createdFrom("2012/7/7")}}).toArray(function (err , docs){

                    var allViewDataUser = JSON.stringify(docs);

                    console.log(allViewDataUser);
                    socket.emit('all-view-data-user', allViewDataUser);

                });

                relationships.find({ _id: {$gt: historic.createdFrom("2012/7/7")}}).toArray(function (err , docs){

                    var allViewDataRelationship = JSON.stringify(docs);

                    console.log(allViewDataRelationship);
                    socket.emit('all-view-data-relationship', allViewDataRelationship);

                });
            });

            socket.on('circlebuzz', function (id) {

                    console.log('circle Buzz', id);
                    mqqtclient.publishOnClient(id +'/buzz/circle', '1');

            });

            socket.on('fbbuzz', function (id) {

                    console.log('FRONT BACK Buzz', id);
                    mqqtclient.publishOnClient(id +'/buzz/fb', '1');

            });

            socket.on('allbuzz', function (id) {

                    console.log('ALL Buzz', id);
                    mqqtclient.publishOnClient(id +'/buzz/all', '1');

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
                            latestTopic = packet.topic + ' ' +  packet.payload;
                            console.log(latestTopic);


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

            connectionID = findconid.findConnnectionId( thisPrimary, thisSecondary);
            stringConnectionID = connectionID + '';

             if ( repeatconnection.conBoo[stringConnectionID] === false ) {

                    //console.log( repeatconnection.conBoo,'   CONECTIONS AVALIBLE:. ');

                            updateUserMax( thisPrimary ,thisSecondary , 1 ); //UPDATE Max Connections

                            console.log ( 'UPDATING USER MAX',thisPrimary, "   ",thisSecondary );

                            updateRelationshipDbEntry( connectionID ); //UPDATE Relationship connection

                    repeatconnection.conBoo[stringConnectionID] = true; // BLOCK CONNECTIONS UNTIL TIMER SETS THIS FALSE

                    repeatconnection.timeDelayForConnection(stringConnectionID); // RUN FUNCTION FOR THIS CONNECTION ID

            } else {

                console.log('DID NOT UPDATE, TIMER DELAY IS: ', repeatconnection.conBoo[stringConnectionID]);

            }
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
