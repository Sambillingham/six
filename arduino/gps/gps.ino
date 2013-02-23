//include files
#include <TinyGPS.h>
#include <SPI.h>
#include <WiFly.h>
#include <PubSubClient.h>
#include <Ethernet.h>
#include <SimpleTimer.h>
#include <stdlib.h>

#include "Credentials.h"

//global variables

  TinyGPS gps;
  boolean gpsLocked;
  int id = 1;
  float latitude;
  float longitude;
  char lonBuf[20];
  char latBuf[20];
  SimpleTimer timer;
  
//LED Toggle Testing  

int LedCheckPin = 13;
int state = LOW;
void toggleLED() {
    state = !state;
    digitalWrite(LedCheckPin, state);  
}  


//Change depending on the MQTT broker either local/Sam's Linode
byte ip[] = { 192, 168, 0, 8 };

WiFlyClient wiFlyClient;
PubSubClient cl(ip, 8085, callback, wiFlyClient);

//subTopic that the MQTT broker replies on.

char*  subTopic="1/buzz";
char*  pubTopicGpsLat="1/gpsLat";
char*  pubTopicGpsLong="1/gpsLong";

void callback(char* topic, byte* payload, unsigned int length) {
  if(String(topic)==subTopic){
    Serial.println("Fuck you MQTT!");
  }
  }


/****************************************************/

//Arduino setup
void setup()
{
    Serial.begin(4800);
    pinMode(4, OUTPUT);     
    pinMode(5, OUTPUT); 
    pinMode(6, OUTPUT); 
    pinMode(7, OUTPUT); 
    pinMode(8, OUTPUT); 
    pinMode(9, OUTPUT); 
    pinMode(2, OUTPUT); 
    pinMode(3, OUTPUT);
    
    WiFly.begin();
    
    Serial.println("WiFly began.. Connecting...");
         
    if (!WiFly.join(ssid, passphrase)) {
    
      Serial.println("Connection failed.");
    
      while (1) {
      // Hang on failure.
    }
  }
  
  timer.setInterval(2500, getGPS);

  
  cl.connect("ardWiFly");
  cl.subscribe(subTopic);
  Serial.println("Connected to WiFi!");
 
}

void loop()
{
    cl.loop();
    timer.run();
    //getGPS();


    //delay(2000);
    //buzz_1();
    //buzz_2();
    //buzz_3();
    //buzz_4();
}
/***************************************************/

//Custom fucntion
void getGPS()
{
  bool newData = false;
  unsigned long chars;
  unsigned short sentences, failed;

   //For one second we parse GPS data and report some key values
  for (unsigned long start = millis(); millis() - start < 1000;)
  {
      while (Serial.available())
      {
          char c = Serial.read();
         cl.loop();
         // Serial.write(c); // uncomment this line if you want to see the GPS data flowing
          if (gps.encode(c)) // Did a new valid sentence come in?
            newData = true;
     }
  }

  if (newData)
 {
     gpsLocked = true;
     unsigned long age;
     gps.f_get_position(&latitude, &longitude, &age);
     latitude == TinyGPS::GPS_INVALID_F_ANGLE ? 0.0 : latitude, 6;
      longitude == TinyGPS::GPS_INVALID_F_ANGLE ? 0.0 : longitude, 6;
     
      dtostrf(latitude, 10,6,latBuf);
      dtostrf(longitude,10,6, lonBuf);
  
}
  else
  {
      gpsLocked = false;

      cl.publish(pubTopicGpsLat,latBuf);
            delay(500);
      cl.publish(pubTopicGpsLong,lonBuf);
      Serial.println("Message sent");
  }
}

void printGPS()
{

  if (gpsLocked == true)
  {
    Serial.println("\n*************\nGPS CONNECTED\n");
   
}
  else
  {
    Serial.println("\n*************\nGPS FAILED\n");
  }
  
  Serial.println(latitude);
  Serial.println(longitude);
  Serial.println(latBuf);
  Serial.println(lonBuf);
  
  Serial.println("*************\n");
}



void buzz_1(){
  digitalWrite(4, HIGH);
  digitalWrite(5, HIGH);
  Serial.println("Buzz 1");
  delay(1000);
  digitalWrite(4, LOW);
  digitalWrite(5, LOW);
  delay(1000);
}

void buzz_2(){
  digitalWrite(6, HIGH);
  digitalWrite(7, HIGH);
  Serial.println("Buzz 2");
  delay(1000);
  digitalWrite(6, LOW);
  digitalWrite(7, LOW);
  delay(1000);
}

void buzz_3(){
  digitalWrite(8, HIGH);
  digitalWrite(9, HIGH);
  Serial.println("Buzz 3");
  delay(1000);
  digitalWrite(8, LOW);
  digitalWrite(9, LOW);
  delay(1000);
}

void buzz_4(){
  digitalWrite(2, HIGH);
  digitalWrite(3, HIGH);
  Serial.println("Buzz 4");
  delay(1000);
  digitalWrite(2, LOW);
  digitalWrite(3, LOW);
  delay(1000);
}
/***************************************************/
