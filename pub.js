var express = require('express');
var bodyParser = require('body-parser');

var poolMysQL = require('./mysql');
var mqttClient = require('./mqtt');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

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

// const sql = 'DELETE FROM dados_incendio_florestal WHERE hora IS NULL';
// poolMysQL.query(sql, function(error, results, fields) {
//   if (error) return console.log(error);
//   console.log(results);
// });

app.post('/insert', function(req, res) {
  let obj = {
    temperatura: req.body.temperatura,
    mq135: req.body.mq135,
    data: JSON.stringify(new Date()).replace(/"/g, '')
  };

  var sql = `INSERT INTO dados_incendio_florestal (temperatura, mq135, data) VALUES ('${obj.temperatura}', '${
    obj.mq135
  }', '${obj.data}')`;

  poolMysQL.query(sql, function(err, result) {
    if (err) throw err;
  });

  res.send({ status: 'Successfully added!', code: 200 });
});

app.post('/notify/company', function(req, res) {
  let obj = {
    topic: '@notification/company',
    message: req.body.message,
    data: JSON.stringify(new Date()).replace(/"/g, '')
  };

  mqttClient.publish('@notification/company', JSON.stringify(obj));

  res.send({ status: 'Successfully notified!', code: 200 });
});

app.post('/notify/pessoas', function(req, res) {
  let obj = {
    topic: '@notification/pessoas',
    message: req.body.message,
    data: JSON.stringify(new Date()).replace(/"/g, '')
  };

  mqttClient.publish('@notification/pessoas', JSON.stringify(obj));

  res.send({ status: 'Successfully notified!', code: 200 });
});

setInterval(() => {
  const sql = 'SELECT * FROM dados_incendio_florestal';
  poolMysQL.query(sql, function(error, results, fields) {
    if (error) return console.log(error);

    const allData = JSON.parse(JSON.stringify(results));

    const filteredData = allData.filter(
      i => ((i.temperatura > 50 || i.mq135 > 850) && i.notificado === 0) || i.notificado === null
    );

    filteredData.map(i => {
      const sql = `UPDATE dados_incendio_florestal SET notificado=1 WHERE ID=${i.id}`;
      poolMysQL.query(sql, function(error, results, fields) {
        if (error) return console.log(error);
      });

      mqttClient.publish(
        'sensors',
        JSON.stringify({ topic: 'sensors', temperatura: i.temperatura, mq135: i.mq135 !== null ? i.mq135 : 0 })
      );
    });

    console.log(filteredData);
  });
}, 5000);

// //--no-stdin
// var stdin = process.stdin;
// stdin.setRawMode(true);
// stdin.resume();
// stdin.setEncoding('utf8');

// stdin.on('data', function(key) {
//   if (key === '\u0003') process.exit();

//   if (key === 'd') {
//     const data = JSON.stringify({ temperatura: 0.4 });
//     mqttClient.publish('sensors', data);
//     console.log('Message Sent: ', data);
//   }
// });
