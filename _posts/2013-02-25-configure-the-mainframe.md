---
layout: post
title: Configure The Mainframe
author: Sam Billingham
---

# The Backend System
*The nearly there edition.


## Node js
Five weeks ago I'd not had a single experience with Node.js but had heard about how powerful a tool it could be. Node.js is a serve side implementation of Javascript, i set out to learn Node.js for Six and another project [lucid](http://samillingham.github.com/lucid) with little prior experience of Javascript, previously only using basic functionality and some Jquery snippetsts. 

### Express framework 


### MQTT Broker 
- Allows matt clients to connect and then works just to mediate messages between all connected clients. 

### MQTT Publish Client
I was able to integrate a simple MQTT client that sits within the Node.js app. Now the client was available server-side I could simply use a function to connect the client to our MQTT broker and another function throughout out server that would pass in a topic and a packet of information to be sent whenever necessary. We used this publish client a number of times both for automated response when our users make connections and when manual buttons are pressed within the user interface online. When buttons are pressed on the user interface a corresponding socket connection is made and then the server responses by running the publish client functions with relevant parameters. 

# Frontend

- socket.io 
- Prototype with 2x cube setup for three.js
- plugging sockets implementation into the Three.js Vis 
- using MQTT Utility for testing
- why use all this tech?
- Compare to the ESN