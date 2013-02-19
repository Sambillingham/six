#include <WiFly.h>
#include "Wifi_Credentials.h"
#include <PubSubClient.h>

//#include <SoftwareSerial.h>
#include <stdlib.h>
//#include <TinyGPS.h>

/*************************VARIABLES*************************/
int id = 1;

float latitude = 0;
float longitude = 0;

const int buttonPin = 2;     // the number of the pushbutton pin
const int ledPin =  A5;      // the number of the LED Board pin
const int buzzerPin = A4;
int buttonState = 0;         // variable for reading the pushbutton status

int timer = 0;
/***********************************************************/

/**********************TOGGLE FOR LED***********************/
int LedCheckPin = 13;
int state;
void toggleLED() {
    state = !state;
    digitalWrite(LedCheckPin, state);  
}
/***********************************************************/

/**********************SETUP FOR MQTT***********************/
void callback(char *a, uint8_t *b, int c);
uint8_t ip[] = { 178, 79, 132, 119 };
PubSubClient cl(ip, 8085, callback);

char*  subTopic="tog/c/l";
char*  pubTopicGpsLat="1/GpsLat";
char*  pubTopicGpsLong="1/GpsLong";

void callback(char *topic, uint8_t *data, int dataLen) {
    if (String(topic) == subTopic) {
      toggleLED();
    }
}
/***********************************************************/

/********************CHANGE GPS LOCATION********************/

void changeGPS(int check){
  
  switch (check) {
    
    case 0:
      // Babbage
      longitude = -4.14084;
      latitude = 50.37558;
      break;
      
    case 1:
      // North Hill
      longitude = -4.13743;
      latitude = 50.37496;
      break;
      
    case 2:
      // Mutley Plain
      longitude = -4.13399;
      latitude = 50.38238;
      break;
      
    default: 
      longitude = 0;
      latitude = 0;
  }
}
/***********************************************************/

void setup()
{
    //Set serial port
    Serial.begin(115200);
    
    //Set Input and output pins
    pinMode(LedCheckPin, OUTPUT);
    pinMode(ledPin, OUTPUT);
    pinMode(buzzerPin, OUTPUT);
    pinMode(buttonPin, INPUT); 
    
    //Start Wifly
    WiFly.begin();
    Serial.println("Wifly begin");
    
    if (!WiFly.join(ssid, passphrase)) {
      Serial.println("Association failed.");
      while (1) {
        // Hang on failure.
      }
    }
  
    Serial.println("Associated!");
    
    
    cl.connect("ardWiFly");
    Serial.println("arduino3");
    cl.subscribe(subTopic);
    Serial.println("arduino4");
    
    // Flash the LED 5 times to signify we have successfully connected to the Wireless LAN
    state = LOW;
    for (int i = 0; i < 10; i++)
    {
        toggleLED();
        delay(500);
    }
    changeGPS(0);
}

void loop()
{
      
      timer = timer+1;
      if (timer >=10)
      {
        changeGPS(1);
        digitalWrite(ledPin, HIGH);
        //analogWrite(buzzerPin, 400);
      }
      
      
      //convert longitude to char array, ready for  publishing
      char longitudeChar[20];
      dtostrf(longitude,10,6, longitudeChar);
      
      //convert latitude to char array, ready for  publishing
      char latitudeChar[20];
      dtostrf(latitude, 10,6,latitudeChar);
      
      cl.loop();
      
      cl.publish(pubTopicGpsLong, longitudeChar);
      Serial.print("long: ");
      Serial.print(longitude);
      Serial.println(" ");
      
      cl.publish(pubTopicGpsLat, latitudeChar);
      Serial.print("lat: ");
      Serial.println(latitude);
      Serial.println(" ");
      
      delay(10000);
}
