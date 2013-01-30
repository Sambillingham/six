var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
    mongoClient = require('mongodb').MongoClient,
    socketsPort = 8080,
    mqttPort = 1883;


var testDB='',
    connections = {
        p1p2: "50",
        p1p3: "70",
        p2p3: "20",
    },
    personOne = {
        gpsLat: "200",
        gpsLong: "400",
        randomNum: "287",
    };
    personTwo = {
        gpsLat: "200",
        gpsLong: "340",
        randomNum: "237",
    };

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

                        socket.emit("persononedata", personOne);

                        socket.emit("persontwodata", personTwo);

                        publishClient();

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

                    // FILL Objects for Database to read  

                    switch (packet.topic) {

                    case '1/GpsLat':

                            personOne.gpsLat = packet.payload;
                    break;
                    case '1/GpsLong':

                            personOne.gpsLong = packet.payload;
                    break;
                    case '1/RandomNum':

                            personOne.randomNum = packet.payload;
                    break;
                    case '2/GpsLat':

                            personTwo.gpsLat = packet.payload;
                    break;
                    case '2/GpsLong':

                            personTwo.gpsLong = packet.payload;
                    break;
                    case '2/RandomNum':

                            personTwo.randomNum = packet.payload;
                    break;
                   // default:
                            console.log('NO RELEVANT MQTT TOPIC FOUND');

                    }

                    // END FILLING OBJECTS

            if (packet.topic == 'dbTestSend') {
              
              console.log('______ dbTestSend _____', packet.payload);
              dbTestSendVal = packet.payload;
              console.log('Sent'+dbTestSendVal );

              
            };

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

function publishClient () {

var thisMqttClient = mqtt.createClient( mqttPort, "192.168.0.20", function (err, client) {
  
      if (err) {

                console.log("Unable to connect to broker");
                process.exit(1);
      }


        client.connect({

                 client: "buzz"

              //  keepalive: 3000

        });

        client.on('connack', function (packet) {

            if (packet.returnCode === 0) {

                    if (personOne.gpsLat == personTwo.gpsLat ){
                          
                            client.publish({

                                topic: '/buzz',

                                payload: '1'
                        
                            });
                    }

                client.disconnect();

            } else {

                    console.log('connack error %d', packet.returnCode);

                    process.exit(-1);

            }
        });

        client.on('close', function () {

                 //   process.exit(0);

        });

        client.on('error', function (e) {

                console.log('error %s', e);

                process.exit(-1);

        });
});

}