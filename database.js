const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',  
  user: 'root',  
  password: 'Alfebella753',  
  database: 'proyectopanelsolar'
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conexión a la base de datos exitosa');
});
