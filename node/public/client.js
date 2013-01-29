var mqtt = require('mqttjs'), 
	port = 1883,
  	host = "http://141.163.234.145"

var thisMqttClient = mqtt.createClient( port , host, function(err, client) {

  if (err) {

        console.log("Unable to connect to broker");
        process.exit(1);

  }

    client.connect({

            keepalive: 3000

    });

    client.on('connack', function(packet) {

    if (packet.returnCode === 0) {

            client.publish({

                    topic: topic,

                    payload: payload

            });

            client.disconnect();

    } else {

      console.log('connack error %d', packet.returnCode);

      process.exit(-1);

    }
  });

  client.on('close', function() {
    process.exit(0);
  });

  client.on('error', function(e) {
    console.log('error %s', e);
    process.exit(-1);
  });
});
// END PUBLISH CLIENT

console.log("----------------------------");
console.log("MQTT Server: ", thisMqttClient);
console.log("----------------------------");