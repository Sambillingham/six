var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
    Db = require('mongodb').Db,
    socketsPort = 8080,
    mqttPort = 1883;
    relationships = '';
    gpsLatData = [];
    gpsLongData = [];


var testDB='',
    connections = {
        p1p2: "50",
        p1p3: "70",
        p2p3: "20",
    },
    personOne = {
        gpsLat: "3425.12",
        gpsLong: "400",
        bpm: "87",
        temp: "21",
        };

// Connect to the db

console.log('Connecting you to the grid.. Please wait..')

Db.connect("mongodb://localhost:27017/test", function(err, db) {
  if(!err)
  
  console.log('You have joined the grid.');

    relationships =  db.collection('Relationships')

        console.log('The grid has a collection.')

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

                        setTimeout(arguments.callee, 1000);

                    })();

              });

            // END sockets Server

// MQTT Server

var thisMqttServer = mqtt.createServer(function(client) {

    var self = this;

    if (self.clients === undefined) self.clients = {};



    client.on('connect', function(packet) {

            console.log('we have a connection', packet);
            client.connack({returnCode: 0});
            client.id = packet.client;
            self.clients[client.id] = client;

    });

    client.on('publish', function(packet) {

        console.log('this is a pub packet: ', packet);
        for (var k in self.clients) {

          self.clients[k].publish({topic: packet.topic, payload: packet.payload});

          // LUKE PLEASE DONT DELETE ME AGAIN

            if (packet.topic == '1/gps/long'){

                    personOne.gpsLong = packet.payload;

            }

          // !!!

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
                            };
                        }
                    })
            

    client.on('subscribe', function(packet) {

        var granted = [];
        for (var i = 0; i < packet.subscriptions.length; i++) {
        granted.push(packet.subscriptions[i].qos);

    }

    client.suback({granted: granted});
    });

    client.on('pingreq', function(packet) {

        client.pingresp();

    });

    client.on('disconnect', function(packet) {

        client.stream.end();

    });

    client.on('close', function(err) {

        delete self.clients[client.id];

    });

    client.on('error', function(err) {

        client.stream.end();
        util.log('error!');

    });

      


}).listen(mqttPort);


// END mqtt Server

console.log("----------------------------"); 
console.log("MQTT Server: ", thisMqttServer); 
console.log("----------------------------"); 
