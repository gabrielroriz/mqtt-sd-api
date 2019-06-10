var mqtt = require('mqtt');
var client = mqtt.connect('ws://localhost:8080');

client.on('connect', function() {
  console.log("It's connected.");
  client.subscribe('sensors');
});

client.on('message', function(topic, message) {
  context = JSON.parse(message.toString());
  console.log(context.data);
});
