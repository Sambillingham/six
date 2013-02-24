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
  String arduinoIdentifier = "Arduino One";
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

//subTopics that the MQTT broker replies on.


char*  patternOneSubTopic = "1/buzz/1";
char*  patternTwoSubTopic = "1/buzz/2";
char*  patternThreeSubTopic = "1/buzz/3";
char*  patternFourSubTopic = "1/buzz/4";

//pubTopics that the Arduino publishes on.

char*  pubTopicGpsLat="1/gpsLat";
char*  pubTopicGpsLong="1/gpsLong";

void callback(char* topic, byte* payload, unsigned int length) {
  
  if(String(topic) == patternOneSubTopic){
    buzz_1();  
  }
  
  if(String(topic) == patternTwoSubTopic){
    buzz_2();
  }
  
  if(String(topic) == patternThreeSubTopic){
    buzz_3();
  }
  
  if(String(topic) == patternFourSubTopic){
    buzz_4();
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
  Serial.println("Connected to WiFi!");
  
  timer.setInterval(2500, getGPS);
  
  mqttSubscribe();
  
}

void loop()
{
    cl.loop();
    timer.run();
    Serial.println(String(cl.connected()));
    if(cl.connected()==false){
      Serial.println("Disconnected from MQTT broker.");
      Serial.println("Retrying connection...");
      mqttSubscribe();
    }
    
    if(wiFlyClient.connected()==false){
      Serial.println("Disconnected from WiFi.");
      Serial.println("Retrying connection...");
      wifiConnect();
    }

}
/***************************************************/

//Custom fucntion

void wifiConnect() {
  
  WiFly.begin();
    
    Serial.println("WiFly began.. Connecting...");
         
    if (!WiFly.join(ssid, passphrase)) {
    
      Serial.println("Connection failed.");
    
      while (1) {
      // Hang on failure.
      } 
  }

}

void mqttSubscribe(){
  
  if(cl.connect("ArduinoOne")){
  
  cl.subscribe(patternOneSubTopic);
  cl.subscribe(patternTwoSubTopic);
  cl.subscribe(patternThreeSubTopic);
  cl.subscribe(patternFourSubTopic);
  
  Serial.println("MQTT subscribed.");

  }
  
  //Connects even without finding the MQTT broker,
  
  else {
    
  Serial.println("MQTT subscription failed.");

  }
}
  

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
      
     cl.publish(pubTopicGpsLat,latBuf);
     delay(500);
     cl.publish(pubTopicGpsLong,lonBuf);
  
}
  else
  {
      gpsLocked = false;
  }
  
  printGPS();
  
}

void printGPS()
{

  if (gpsLocked == true)
  {
    Serial.println("GPS Connected.");
  }
  else
  {
    Serial.println("GPS failed to connect.");
  }
  Serial.println(latitude);
  Serial.println(longitude);
  Serial.println(latBuf);
  Serial.println(lonBuf);
  Serial.println("------");
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
