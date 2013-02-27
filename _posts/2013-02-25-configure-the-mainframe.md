---
layout: post
title: Configure The Mainframe
author: Sam Billingham
---

I decided to self delegate myself the role of setting up and developing the backend for project Six, this involved me learning Node.js, web sockets, how to implement a server-side MQTT broker and know enough about three.js to plug things together on the client side.


### Node js
Node.js is a serve side implementation of Javascript, I set out to learn Node.js for Six and another project [lucid](http://sambillingham.github.com/lucid/) with little prior experience of Javascript, previously only using basic functionality and some Jquery snippets. Node.js gave us the ability to develop a system that could receive information from our Arduino setup, deal with   the logic and calculation and then send relevant data for the visualisation through sockets to the web client. Five weeks ago I'd not had a single experience with Node.js but by the end of our project, Six had a fully functioning database enabled backend running on Node.js. All of the code discussed here is available on our Github repo [here.](http://github.com/Sambillingham/six)

I decided to use the [express framework](http://expressjs.com/guide.html) for Node.js which would allow me to scale the project nicely if/when we needed more than a single page. Acting a a simple http server express deals with requests sending all users that access the web app on port :8080 to '/' our index page, when we needed I added another route for '/multi' for our example view of a system with more users.

### MQTT Broker 
The MQTT broker was to be one of the most important links in our chain providing the support for the Arduino controlled devices to communicate with the server in real-time using a pub/sub pattern. For our previous project [ESN](https://vimeo.com/56017590) we used a local version of the RSMB provided by IBM, that worked great in that project but required all devices to be  connected to a local network as such meant it was only available within one building. Six was to be a much larger endeavour, be real world applicable and allow our Arduino devices to be mobile and still connected to the system.

The Node.js MQTT implementation worked like any other broker allowing MQTT clients to publish on any channels, it will pass these packets to all clients who are subscribed on that same channel. All though not technically subscribed to the packets the MQTT Sever is passing packets published onto other client and these can be read, manipulated if needed and stored stored  while still passing them to all clients that are subscribed. We had our Arduino devices publishing on [id]/gpsLong and [id]/gpsLat for there current positions this information was then parsed by the server and stored in a temporary object checked against the current location of every other Arduino device in the system and overwritten each time there is a new position.

Each time a new relevant packet is recovered it check against every know position of other Arduino's in the system. If any of the users within the system are within our threshold ( We used 

As the Node server is running continuously on my VPS server any Arduino that has access to the internet can publish/subscribe MQTT topics to the specific IP on port 8085, this allowing for access on the move when combined with 3G.

### MQTT Publish Client
I was able to integrate a simple MQTT client that sits within the Node.js app. Now the client was available server-side I could simply use a function to connect the client to our MQTT broker and another function throughout out server that would pass in a topic and a packet of information to be sent whenever necessary. We used this publish client a number of times both for automated response when our users make connections and when manual buttons are pressed within the user interface online. When buttons are pressed on the user interface a corresponding socket connection is made and then the server responses by running the publish client functions with relevant parameters.

## mosquitto.js
After looking into MQTT in preparation for this build I and other on the course came across an open source Javascript MQTT client named [mosquito.js](http://mosquitto.org/download/). It seemed we had stuck Gold as a Javascipt MQTT client could possibly cut out the need for a web socket solution and possibly even a our Node.js system. Although this library is listed on the MQTT site it unfortunately only runs under very strict circumstances requiring the mosquito broker, a lighttpd sever and a specific web sockets plugin so became unnecessary.

## Frontend

- socket.io 
- Prototype with 2x cube setup for three.js
- plugging sockets implementation into the Three.js Vis 
- using MQTT Utility for testing
- why use all this tech?
- Compare to the ESN

# Why not use a phone and geoLocation?