#include <WiFly.h>
#include "Wifi_Credentials.h"
#include <PubSubClient.h>

//#include <SoftwareSerial.h>
#include <stdlib.h>
//#include <TinyGPS.h>

/*************************VARIABLES*************************/
int id = 1;

int randomNumber = random(50,100);
float latitude = 0;
float longitude = 0;
int randomNumberTwo = random(0,100);

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
uint8_t ip[] = { 192, 168, 0, 8 };
PubSubClient cl(ip, 1883, callback);

char*  subTopic="tog/c/l";
char*  pubTopicGpsLat="six/1/GpsLat";
char*  pubTopicGpsLong="six/1/GpsLong";
char*  pubTopicRandomNum="six/1/RandomNum";

void callback(char *topic, uint8_t *data, int dataLen) {
    if (String(topic) == subTopic) {
      toggleLED();
    }
}
/***********************************************************/

/********************CHANGE GPS LOCATION********************/

void changeGPS(int check){
  if (check == 1)
  {
    longitude = -4.14;
    latitude = 50.375;
  }
  else
  {
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
    Serial.println("Wifi starting..");
    if (!WiFly.join(ssid, passphrase)) {
      Serial.println("Association failed.");
      while (1) {
        Serial.println("Failing to connect...");
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
}

void loop()
{
      // read the state of the pushbutton value:
      buttonState = digitalRead(buttonPin);
    
      // check if the pushbutton is pressed.
      // if it is, the buttonState is HIGH:
      /*if (buttonState == HIGH) {     
         changeGPS(1);
      } 
      else {
         changeGPS(0);
      }*/
      timer = timer+1;
      if (timer >=10)
      {
        changeGPS(1);
        digitalWrite(ledPin, HIGH);
        //analogWrite(buzzerPin, 400);
      }
      
      
        randomNumberTwo = random(0,100);
      
      //convert longitude to char array, ready for  publishing
      char longitudeChar[20];
      dtostrf(longitude,10,6, longitudeChar);
      
      //convert latitude to char array, ready for  publishing
      char latitudeChar[20];
      dtostrf(latitude, 10,6,latitudeChar);
      
      //convert randomNumber to char array, ready for  publishing
      char randomNumberChar[20];
      dtostrf(randomNumber, 10,6,randomNumberChar);
      
      cl.loop();
      cl.publish(pubTopicGpsLong, longitudeChar);
      Serial.print("long: ");
      Serial.print(longitude);
      Serial.println(" ");
      
      cl.publish(pubTopicGpsLat, latitudeChar);
      Serial.print("lat: ");
      Serial.println(latitude);
      Serial.println(" ");
      
      cl.publish(pubTopicRandomNum, randomNumberChar);
      Serial.print("rn: ");
      Serial.println(randomNumber);
      Serial.println(" ");
      
      //convert randomNumber to char array, ready for  publishing
      char randomNumberTwoChar[20];
      dtostrf(randomNumberTwo, 10,6,randomNumberTwoChar);
      
      cl.publish("dbTestSend", randomNumberTwoChar);
      Serial.print("rn2");
      Serial.println(randomNumberTwo);
      Serial.println(" ");
      
      delay(10000);
}
