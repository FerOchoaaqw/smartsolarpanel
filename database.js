const mysql = require('mysql');

// Verificar las variables de entorno para la conexión
console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('DATABASE_USER:', process.env.DATABASE_USER);
console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD);
console.log('DATABASE_NAME:', process.env.DATABASE_NAME);

// Crear la conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,  // Asegúrate de que este valor sea correcto
  user: process.env.DATABASE_USER,  // Asegúrate de que este valor sea correcto
  password: process.env.DATABASE_PASSWORD,  // Asegúrate de que este valor sea correcto
  database: process.env.DATABASE_NAME  // Asegúrate de que este valor sea correcto
});

// Intentar conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos MySQL:', err.stack);
    return;
  }
  console.log('Conexión a la base de datos MySQL exitosa');
});
