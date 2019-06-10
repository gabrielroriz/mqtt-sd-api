var http = require('http'),
  httpServ = http.createServer(),
  mosca = require('mosca'),
  mqttServ = new mosca.Server({});

mqttServ.on('clientConnected', function(client) {
  console.log(`Client [${client.id}] connected.`);
});

mqttServ.on('published', function(packet, client) {
  // console.log('Published', client);
});

mqttServ.on('ready', function() {
  console.log('Mosca server is up and running.');
});

mqttServ.attachHttpServer(httpServ);

httpServ.listen(8080);
