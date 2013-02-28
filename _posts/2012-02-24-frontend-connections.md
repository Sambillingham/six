---
layout: post
title: frontend connections
author: Sam Billingham
---

## Frontend

I used Socket.io which is a node module but using the html5 web sockets protocol, it extends this protocol and adds fallbacks for when it is not available as-well as adds more advanced functionality over standard sockets.

Every 1.5 seconds the server accesses the database, finds the latest entry for all of the users latest max connection and for the relationships and sends them though to the client via a socket connection. Using web sockets allowed for this communication in real-time whenever the system needed updating.

Using web sockets was a classic lightbulb moment, it took a couple days of playing around, working with examples and breaking things but eventually something twigged and it all came together. Once I realised to think of a 'socket.on' as an event listener and 'socket.emit' as what fires that, it became pretty simple and I was able to create all the functionality we needed.

I had a little adventure with three.js myself, just enough to know where to plug the data received through sockets into and how to basic camera/render setup worked. This testing phase was also useful for using MQTT inputs running through the server to make sure the connections make it all the way through the chain and can affect the webgl render in real-time. Fun fun.

## Why not use a phone and geoLocation?
As with any project Six changed a lot during its development, we began to focus more on the connections forming based on proximity and less about data from sensors. We decided to stick with using an Arduino form factor because we wanted to base our project around wearable technology, so even though we could get similar functionality using a mobile device we decided not to.