---
layout: post
title: Hooking up the Arduinos
author: Chris Packard
---

![Arduino Belt]({{site.baseurl}}/img/belt_1LR.jpg)

The physical components of the Six Project are centered around Arduinos. My role in the Six Project was to develop and then construct our setup, i wrote the code and tested everything was working correctly throughout our project.

Each person who is part of the Six Project has a belt (or other wearable tech) with an Arduino attached. These Arduinos use a Wifly shield to connect to a wifi hotspot created by the user’s  phone and then allowing the Arduino to access the phones 3G connection. Once a successful internet connection has been established, the Arduino then connects to our Node app where the calculations and  connections for the Six project can be made and then results databased.

![Arduino Belt]({{site.baseurl}}/img/belt_2LR.jpg)

Every person with Six has a belt housing a GPS locator which sends the user’s current longitude and latitude coordinates as MQTT packets to the node server. A function runs on the server to determine if the user is near any other user. If they are, their relationship with that person increases.

As well as the data value for this relationship increasing, the user receives haptic feedback in the form of four vibration motors. These vibrate in different combinations to offer the user information on their relationship with the people they are near. There are currently three different patterns of vibrations: one for when a new relationship is created, one for when a relationship exists, but the relationship value is low, and one for when a relationship exists, and the relationship value is high.

A belt was used as it is a common everyday clothing accessory that many people use. It is also very easy to embed vibration motors in an inconspicuous way, yet still be easily felt by each user.

As well as being the main programmer of the Arduinos I also helped with some of the technicalities of the three.js web experience. This included writing mathematical equations for mapping each orb at certain angles, getting the orbs to animate when their respective radii change and connecting the relationship lines to the orbs they connect.


