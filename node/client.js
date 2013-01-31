var mqtt = require('mqttjs');

var thisMqttClient = mqtt.createClient( 1883, "192.168.0.20", function (err, client) {
  
      if (err) {

            console.log("Unable to connect to broker");
            process.exit(1);
      }


        client.connect ({

            client: "buzzClient"

          //  keepalive: 3000

        });

        client.on('connack', function (packet) {

            if (packet.returnCode === 0) {

                client.publish({

                        topic: '/crazy',

                        payload: 'bitches be'
                    });

                client.disconnect();

            } else {

                console.log('connack error %d', packet.returnCode);
                process.exit(-1);

            }
        });

        client.on('close', function () {

        //    process.exit(0);

        });

        client.on('error', function (e) {

        console.log('error %s', e);

        process.exit(-1);

  });
});

console.log("----------------------------"); 
console.log("MQTT Server: ", thisMqttClient); 
console.log("----------------------------"); 
