const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secreto_secreto',
  resave: false,
  saveUninitialized: true
}));

// Inicializar Supabase
const supabase = createClient('https://jedepefvgyhzkkcwccfe.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZGVwZWZ2Z3loemtrY3djY2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjM4NTYsImV4cCI6MjA0NjgzOTg1Nn0.a6LyEMjBDw6mNXd2y0JEnO2IPb9qumG6U1PeJlgjxBU');

// Ruta para servir la página de inicio (login.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina_panel_solar.html'));  // Asegúrate de tener 'login.html' en la raíz del proyecto
});

// Configuración de Nodemailer para enviar correos desde Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Usamos Gmail
  auth: {
    user: 'smartsolarpanel1@gmail.com',  // Tu correo de Gmail
    pass: 'duhq pwze itqb kczt',  // Tu contraseña o contraseña de aplicación
  },
  tls: {
    rejectUnauthorized: false,
  }
});

// Función para convertir tiempo Unix a hora legible
function unixToDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.getHours();
}

// Función para enviar notificación por correo electrónico
async function enviarNotificacion(clima, data) {
  const temperatura = (data.main.temp - 273.15).toFixed(2);  // Convertir de Kelvin a Celsius
  const humedad = data.main.humidity;
  const presion = data.main.pressure;
  const descripcionClima = data.weather[0].description;

  // Obtener hora actual
  const currentHour = new Date().getHours();

  // Verificar si es de día o noche
  let esDeDia = '';
  const sunriseHour = unixToDate(data.sys.sunrise);
  const sunsetHour = unixToDate(data.sys.sunset);

  if (currentHour >= sunriseHour && currentHour < sunsetHour) {
    esDeDia = 'día';
  } else {
    esDeDia = 'noche';
  }

  let mensaje = '';

  if (esDeDia === 'día') {
    // Si es de día, verificamos si es un buen clima
    if (clima === 'soleado') {
      mensaje = `El clima está soleado. Es un buen momento para aprovechar el panel solar.\n
                 Temperatura: ${temperatura}°C\n
                 Humedad: ${humedad}%\n
                 Presión: ${presion} hPa\n
                 Descripción del clima: ${descripcionClima}\n
                 Es de ${esDeDia}.`;
    } else if (clima === 'lluvioso' || clima === 'nublado') {
      mensaje = `El clima no es óptimo para el panel solar. Es mejor esperar a que mejore el clima.\n
                 Temperatura: ${temperatura}°C\n
                 Humedad: ${humedad}%\n
                 Presión: ${presion} hPa\n
                 Descripción del clima: ${descripcionClima}\n
                 Es de ${esDeDia}.`;
    }
  } else {
    // Si es de noche
    mensaje = `Es de noche. No es el momento adecuado para aprovechar el panel solar.\n
               Temperatura: ${temperatura}°C\n
               Humedad: ${humedad}%\n
               Presión: ${presion} hPa\n
               Descripción del clima: ${descripcionClima}\n
               Es de ${esDeDia}.`;
  }

  const destinatarios = ['ferochoaoliveros@gmail.com', 'bryan.sanchezorozco@gmail.com', 'smartsolarpanel1@gmail.com' ];  // Lista de correos
  const mailOptions = {
    from: 'smartsolarpanel1@gmail.com',
    to: destinatarios,  // Enviar a múltiples correos
    subject: 'Condiciones del clima para el panel solar',
    text: mensaje
  };

  try {
    console.log('Enviando correo...');
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado:', mensaje);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

// Función para verificar el clima y enviar notificación si es necesario
async function verificarClima() {
  try {
    const API_KEY = '19a8eb642dc7b4a5c9c4a91f809713f3';  // Tu clave de API
    const lat = 20.6597;
    const lon = -103.3496;

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=es`);

    if (!response.ok) {
      console.error('Error en la solicitud API:', response.statusText);
      return;
    }

    const data = await response.json();
    console.log('Respuesta completa de OpenWeather:', data);

    const clima = data.weather[0].description.toLowerCase();
    console.log('Clima actual:', clima);

    // Agregamos la condición para "cielo claro" como "soleado"
    if (clima.includes('soleado') || clima.includes('cielo claro')) {
      console.log('Clima soleado detectado, enviando notificación...');
      await enviarNotificacion('soleado', data);
    } else if (clima.includes('lluvioso') || clima.includes('nublado') || clima.includes('nubes')) {
      console.log('Clima no ideal detectado, enviando notificación...');
      await enviarNotificacion('nublado', data);
    } else {
      console.log('Clima no reconocido:', clima);
      await enviarNotificacion('desconocido', data);
    }
  } catch (error) {
    console.error('Error al verificar el clima:', error);
  }
}

// Llamar a la función para verificar el clima al iniciar el servidor
verificarClima();

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Verificar que los campos no estén vacíos
  if (!email || !password) {
    return res.status(400).send('Email y contraseña son requeridos');
  }

  try {
    // Buscar el usuario en la base de datos usando Supabase
    const { data: user, error } = await supabase
      .from('usuarios') // nombre de tu tabla
      .select('*')
      .eq('correo', email) // buscar por correo electrónico
      .single(); // solo debería devolver un solo usuario

    if (error || !user) {
      return res.status(401).send('Correo o contraseña incorrectos'); // Si no se encuentra el usuario
    }

    // Comparar la contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send('Correo o contraseña incorrectos'); // Si la contraseña no coincide
    }

    // Si las credenciales son correctas
    req.session.userId = user.id; // Almacenar el ID del usuario en la sesión
    res.redirect('/Estadisticas.html'); // Redirigir a la página de estadísticas

  } catch (err) {
    console.error('Error al buscar el usuario en Supabase:', err);
    res.status(500).send('Error en la base de datos');
  }
});

// Variables para almacenar datos recibidos
let panelData = { servoh: 90, servov: 90, temperature: 27, battery: 32, batteryDuration: 43, humidity: 24 };

// Ruta para recibir datos de Arduino
app.post('/update-stats', (req, res) => {
  panelData = req.body;  // Actualiza el objeto con los datos recibidos
  console.log("Datos actualizados:", panelData);
  res.send("Datos actualizados correctamente");
});

// Ruta para obtener datos en tiempo real
app.get('/get-stats', (req, res) => {
  res.json(panelData);  // Envía el objeto de datos en formato JSON
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  // Llamamos al clima inmediatamente al iniciar
  verificarClima();

  // Llamar a la función para verificar el clima cada 2 horas (7200000 ms)
  setInterval(verificarClima, 7200000);
});
