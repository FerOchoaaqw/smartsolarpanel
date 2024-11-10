const mysql = require('mysql');

// Conexión a la base de datos usando las variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,       // Utiliza la variable de entorno DB_HOST
  user: process.env.DB_USER,       // Utiliza la variable de entorno DB_USER
  password: process.env.DB_PASSWORD,  // Utiliza la variable de entorno DB_PASSWORD
  database: process.env.DB_NAME    // Utiliza la variable de entorno DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
});
