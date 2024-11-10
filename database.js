const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',  
  user: 'root',  
  password: 'Alfebella753',  
  database: 'proyectopanelsolar'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conexión a la base de datos establecida');
});

module.exports = connection;
