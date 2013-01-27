var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    mqtt = require('mqttjs'),
    socketsPort = 8080,
    mqttPort = 1883;

    var gpsLat = '',
        gpsLong = '',
        test = '',
        gpsLongNEW = '',
        blahDB = {
                  items: "some stuff",
                  moreitems: "rah rah"
                  };


console.log('included MQTTjs...');
console.log('MQTT Listening on' + mqttPort);

server.listen(socketsPort);

app.configure(function() {

  app.use(express.static(__dirname + '/public'));

});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

  // Sockets Server


              io.sockets.on('connection', function (socket) {

                      socket.emit('mongo', test );
                  
                  
                  socket.on('my other event', function (data) {
                      console.log(data);
                  });
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

          if (packet.topic == 'test') {
             
              test = packet.payload;
          };
          if (packet.topic == 'gpslat') {

             gpsLongNEW = packet.payload;
            // emitShit();
          };

        }

    });

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


console.log("MQTT Server: ", thisMqttServer);
