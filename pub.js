var express = require('express');
var bodyParser = require('body-parser');

var poolMysQL = require('./mysql');
var mqttClient = require('./mqtt');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = 8002;

app.listen(port, function() {
  console.log(`App listening on port: ${port}.`);
});

app.get('/', function(req, res, next) {
  const sql = 'SELECT * FROM dados_incendio_florestal';
  poolMysQL.query(sql, function(error, results, fields) {
    if (error) return console.log(error);
    res.status(200).send({
      data: JSON.parse(JSON.stringify(results))
    });
  });
});

app.post('/insert', function(req, res) {
  let obj = {
    temperatura: req.body.temperatura,
    data: JSON.stringify(new Date()).replace(/"/g, '')
  };

  mqttClient.publish('sensors', JSON.stringify(obj));

  var sql = `INSERT INTO dados_incendio_florestal (temperatura, data) VALUES ('${obj.temperatura}', '${obj.data}')`;

  poolMysQL.query(sql, function(err, result) {
    if (err) throw err;
  });

  res.send({ status: 'Successfully added!', code: 200 });
});

// //--no-stdin
// var stdin = process.stdin;
// stdin.setRawMode(true);
// stdin.resume();
// stdin.setEncoding('utf8');

// stdin.on('data', function(key) {
//   if (key === '\u0003') process.exit();

//   if (key === 'd') {
//     const data = JSON.stringify({ data: 0.4 });
//     mqttClient.publish('sensors', data);
//     console.log('Message Sent: ', data);
//   }
// });
