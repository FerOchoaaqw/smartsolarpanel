const mysql = require('mysql2');

// Obtener la URL de conexión desde la variable de entorno JAWSDB_URL
const connection = mysql.createConnection(process.env.JAWSDB_URL);

// Conexión a la base de datos
connection.connect((err) => {
  if (err) throw err;
  console.log("Conexión a la base de datos exitosa!");
});

module.exports = connection;
