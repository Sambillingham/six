#include <WiFly.h>
#include "Wifi_Credentials.h"
#include <PubSubClient.h>

//#include <SoftwareSerial.h>
#include <stdlib.h>
//#include <TinyGPS.h>

//global variables
int id = 1;
float latitude = 0;
float longitude = 0;
char*  subTopic="tog/c/l";
char*  pubTopicGpsLat="1/GpsLat";
char*  pubTopicGpsLong="1/GpsLong";

//led check
int LedCheckPin = 13;
int LedCheckPinState = LOW;
void toggleLED() {
    LedCheckPinState = !LedCheckPinState;
    digitalWrite(LedCheckPin, LedCheckPinState);  
}

//MQTT setup
void callback(char *a, uint8_t *b, int c);
uint8_t ip[] = { 178, 79, 132, 119 };
PubSubClient cl(ip, 8085, callback);

void callback(char *topic, uint8_t *data, int dataLen) {
    if (String(topic) == subTopic) {
      toggleLED();
    }
}
/***********************************************************/

void setup()
{
    //Set serial port
    Serial.begin(4800);
    
    //Set Input and output pins
    pinMode(LedCheckPin, OUTPUT);
    
    //Start Wifly
    WiFly.begin();
    Serial.println("Wifly begin");
    
    if (!WiFly.join(ssid, passphrase)) {
      Serial.println("Association failed.");
      while (1) {
        // Hang on failure.
      }
    }
    
    cl.connect("ardWiFly");
    cl.subscribe(subTopic);
    
    Serial.println("Successfully Connected to Wifi!");
}

void loop()
{
    publishCurrentPosition();
    delay(1000);
}

void publishCurrentPosition(){
    //convert longitude to char array, ready for  publishing
    char longitudeChar[20];
    dtostrf(longitude,10,6, longitudeChar);
    
    //convert latitude to char array, ready for  publishing
    char latitudeChar[20];
    dtostrf(latitude, 10,6,latitudeChar);
    
    cl.loop();
    
    //publish longitude and print it to the serial
    cl.publish(pubTopicGpsLong, longitudeChar);
    Serial.print("long: ");
    Serial.print(longitude);
    Serial.println(" ");
    
    //publish latitude and print it to the serial
    cl.publish(pubTopicGpsLat, latitudeChar);
    Serial.print("lat: ");
    Serial.println(latitude);
    Serial.println(" ");
}
