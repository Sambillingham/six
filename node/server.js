var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
    mongoClient = require('mongodb').MongoClient,
    socketsPort = 8080,
    mqttPort = 1883,
    serverAddress = "127.0.0.1",
    distanceCalc = 0.0003,
    proximityThreshold = 0.0003, // Equal to 20m
    NumOfClients = 4;


var testDB='',
    defaultTopic = '/default',
    defaultPayload = "I'm a payload",
    topicId = '',
    payloadDataType = '',
    connections = {
        p1p2: "50",
        p1p3: "70",
        p2p3: "20"
    },
    people = [
        {
            id: "1",
            gpsLat: "50.0103",
            gpsLong: "50.0293",
            randomNum: "-287"
        },
        {
            id: "2",
            gpsLat: "50.0023",
            gpsLong: "50.0999",
            randomNum: "-237"
        },
        {
            id: "3",
            gpsLat: "50.0023",
            gpsLong: "50.0433",
            randomNum: "-227"
        },
        {
            id: "4",
            gpsLat: "50.0345",
            gpsLong: "50.1234",
            randomNum: "-187"
        }

    ]
    // person1 = {
    //     id: "1",
    //     gpsLat: "50.0103",
    //     gpsLong: "50.0293",
    //     randomNum: "-287"
    // };
    // person2 = {
    //     id: "2",
    //     gpsLat: "50.0023",
    //     gpsLong: "50.0999",
    //     randomNum: "-237"
    // };
    // person3 = {
    //     id: "3",
    //     gpsLat: "50.0023",
    //     gpsLong: "50.0433",
    //     randomNum: "-227"
    // };
    // person4 = {
    //     id: "4",
    //     gpsLat: "50.0345",
    //     gpsLong: "50.1234",
    //     randomNum: "-187"
    // };

// Connect to the db
mongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
  if(!err) { 

   userDB = db.collection('Users');
   relationshipsDB = db.collection('Connections')
   changesDB = db.collection('Changes')

   console.log("We are connected");

  };
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

                       // publishClient('2/buzz', '600');

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
                        aID = (topicRemoveSlash[0]) - 1;


                    if ( topicRemoveSlash[1] !== "buzz" ){

                            people[aID][topicRemoveSlash[1]] = packet.payload;
                            proximityCheck(aID);

                    }

                    if (packet.topic === 'dbTestSend') {
                      
                            console.log('______ dbTestSend _____', packet.payload);

                            dbTestSendVal = packet.payload;

                            console.log('Sent'+dbTestSendVal );

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

function locationCheck ( checkMe ) {

            console.log(" We are crunching numbers sir...     I am:  ",  checkMe.id );

            for ( var i = 1 ; i <= NumOfClients ; i++ ) {

                    var person = eval("person" + i);
                    //console.log("looping...  ", person );
                    var disCalcLong = Math.abs(checkMe.gpsLong - person.gpsLong),
                        disCalcLat = Math.abs(checkMe.gpsLat - person.gpsLat);

                        console.log(disCalcLat, disCalcLong);

                    if ( disCalcLat >= distanceCalc) {

                            console.log('Booom  ', checkMe, '  is near  ' , person);
                    }

            }

}

function proximityCheck (id) {

    var thisGpsLat = people[id].gpsLat,
        thisGpsLong = people[id].gpsLong,
        proximityLong = '',
        proximityLat = '';

    for (var i = 0, j = people.length; i < j; i++) {

            proximityLat = Math.abs(thisGpsLat - people[i].gpsLat );
            proximityLong = Math.abs(thisGpsLong - people[i].gpsLong );

            if (i !== id && proximityLat <= proximityThreshold && proximityLong <= proximityThreshold ) {

                    console.log("Person ", (id + 1), " is near to person ", ( i+1) ) ;

            }

    }

}