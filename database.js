const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.localhost,
  user: process.env.root,
  password: process.env.Alfebella753,
  database: 'proyectopanelsolar'
});


connection.connect((err) => {
  if (err) throw err;
  console.log('Conexión a la base de datos establecida');
});

module.exports = connection;
