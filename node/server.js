var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server, { log: false }),
    mqtt = require('mqttjs'),
    relationships = '';
    changes = '';
    users = '';
    gpsLatData = [];
    gpsLongData = [];
    Db = require('mongodb').Db,
    socketsPort = 8080,
    mqttPort = 1883,
    serverAddress = "192.168.0.20";
    
    defaultTopic = '/default',
    defaultPayload = "I'm a payload",

    aID1 = {
        gpsLat: "",
        gpsLong: "",
        ID:"1"
    };
    
    aID2 = {
        gpsLat: "",
        gpsLong: "",
        ID:"2"
    };

    aID3 = {
        gpsLat: "",
        gpsLong: "",
        ID:"3"
    }

    aID4 = {
        gpsLat: "",
        gpsLong: "",
        ID:"4"
    }

// Mongo connection

console.log('Connecting you to the grid.. Please wait..')

Db.connect("mongodb://localhost:27017/test", function(err, db) {
  if(!err)
  
  console.log('You have joined the grid.');

    relationships =  db.collection('Relationships')
    changes = db.collection('Changes')
    users = db.collection('Users')

        console.log('The grid has connected to all the collections.')

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

                        publishClient('/buzz', '600');

                        setTimeout(arguments.callee, 1000);

                    })();

              });

            // END sockets Server

// MQTT Server

var thisMqttServer = mqtt.createServer(function(client) {

    var self = this;

    if (self.clients === undefined) self.clients = {};



    client.on('connect', function (packet) {

            console.log('Someone else has connected to the grid..' + packet.client);

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

                            aID1.gpsLat = packet.payload;
                    break;
                    case '1/GpsLong':

                            aID1.gpsLong = packet.payload;
                    break;
                    case '2/GpsLat':

                            aID2.gpsLat = packet.payload;
                    break;
                    case '2/GpsLong':

                            aID2.gpsLong = packet.payload;
                    break;
                    case '3/GpsLat':

                            aID3.gpsLat = packet.payload;
                    break;
                    case '3/GpsLong':

                            aID3.gpsLong = packet.payload;
                    break;
                    case '4/GpsLat':

                            aID4.gpsLat = packet.payload;
                    break;
                    case '4/GpsLong':

                            aID4.gpsLong = packet.payload;
                    break;
                    
                   // default:
                            console.log('NO RELEVANT MQTT TOPIC FOUND');

                    }

                    // END FILLING OBJECTS

            if (packet.topic == 'GPSLONG') {
              
               console.log('______ dbTestSend _____', packet.payload);
               dbTestSendVal = packet.payload;
               var dbTestSendVal2 = '2';
               updateRTotal(dbTestSendVal,dbTestSendVal2)
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

console.log("Grid connector is now connected."); 
console.log("The grids MQTT server is now running."); 

// var thisMqttClient = mqtt.createClient( mqttPort, serverAddress, function (err, client) {
  
//       if (err) {

//                 console.log("Unable to connect to broker");
//                 process.exit(1);
//       }


//         client.connect({

//                  client: "buzz"

//         });

//         client.on('connack', function (packet) {

//             if (packet.returnCode === 0) {

//                     client.publish({

//                             topic: defaultTopic,

//                             payload: defaultPayload
                        
//                     });

//             } else {

//                     console.log('connack error %d', packet.returnCode);

//                     process.exit(-1);

//             }
//         });

//         client.on('close', function () {

//                 process.exit(0);

//         });

//         client.on('error', function (e) {

//                 console.log('error %s', e);

//                 process.exit(-1);

//         });
// });

function publishClient ( topicName , payloadInfo ) {

        thisMqttClient.publish( {

                topic: topicName,
                
                payload: payloadInfo


        });

}

function updateRTotal (aID1, aID2){
    console.log("Function running..")
    var foo = parseInt(aID1)
    var foo2 = parseInt(aID2)
relationships.find({aID1: {$in:[foo]}, aID2:{$in:[foo2]}}).toArray(function(err,doc){
if(err){
    console.log('The grid refused that query.')
}
console.log(doc)
})
};



