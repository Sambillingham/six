//include files
#include <TinyGPS.h>

//global variables
  //GPS
  TinyGPS gps;
  boolean gpsLocked;
  float latitude;
  float longitude;
  char lonBuf[20];
  char latBuf[20];
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
    pinMode(10, OUTPUT); 
    pinMode(11, OUTPUT);
}

void loop()
{
    getGPS();
    printGPS();
    delay(2000);
    buzz_1();
    buzz_2();
    buzz_3();
    buzz_4();
}
/***************************************************/

//Custom fucntion
void getGPS()
{
  bool newData = false;
  unsigned long chars;
  unsigned short sentences, failed;

  // For one second we parse GPS data and report some key values
  for (unsigned long start = millis(); millis() - start < 1000;)
  {
      while (Serial.available())
      {
          char c = Serial.read();
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
  digitalWrite(10, HIGH);
  digitalWrite(11, HIGH);
  Serial.println("Buzz 4");
  delay(1000);
  digitalWrite(10, LOW);
  digitalWrite(11, LOW);
  delay(1000);
}
/***************************************************/
