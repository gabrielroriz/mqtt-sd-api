const mysql = require('mysql');
const pool = mysql.createPool({
  host: 'br948.hostgator.com.br',
  user: 'andredev_defesa',
  password: 'defesacivil',
  database: 'andredev_defesa_civil'
});

module.exports = pool;
