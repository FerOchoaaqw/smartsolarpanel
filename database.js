const mysql = require('mysql');

// Usamos la variable de entorno JAWSDB_URL para la conexión
const connection = mysql.createConnection(process.env.JAWSDB_URL);

connection.connect(err => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});
