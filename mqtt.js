var mqtt = require('mqtt');

var client = mqtt.connect('ws://localhost:8080');

client.on('connect', function() {
  console.log('MQTT is connected.');
});

module.exports = client;
