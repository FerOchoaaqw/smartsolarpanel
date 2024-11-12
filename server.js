const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secreto_secreto',
  resave: false,
  saveUninitialized: true
}));

// Configuración de Supabase
const supabaseUrl = 'https://jedepefvgyhzkkcwccfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZGVwZWZ2Z3loemtrY3djY2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjM4NTYsImV4cCI6MjA0NjgzOTg1Nn0.a6LyEMjBDw6mNXd2y0JEnO2IPb9qumG6U1PeJlgjxBU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Ruta para servir la página de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina_panel_solar.html'));
});

// Configuración de Nodemailer para enviar correos desde Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smartsolarpanel1@gmail.com',
    pass: 'duhq pwze itqb kczt',
  },
  tls: { rejectUnauthorized: false }
});

// Función para convertir tiempo Unix a hora legible
function unixToDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.getHours();
}

// Función para enviar notificación por correo electrónico
async function enviarNotificacion(clima, data) {
  const temperatura = (data.main.temp - 273.15).toFixed(2);
  const humedad = data.main.humidity;
  const presion = data.main.pressure;
  const descripcionClima = data.weather[0].description;
  const currentHour = new Date().getHours();
  const sunriseHour = unixToDate(data.sys.sunrise);
  const sunsetHour = unixToDate(data.sys.sunset);
  const esDeDia = (currentHour >= sunriseHour && currentHour < sunsetHour) ? 'día' : 'dia';

  let mensaje = '';
  if (esDeDia === 'día') {
    if (clima === 'soleado') {
      mensaje = `El clima está soleado. Buen momento para aprovechar el panel solar.\nTemperatura: ${temperatura}°C\nHumedad: ${humedad}%\nPresión: ${presion} hPa\nDescripción: ${descripcionClima}\nEs de ${esDeDia}.`;
    } else if (clima === 'lluvioso' || clima === 'nublado') {
      mensaje = `El clima está soleado. Buen momento para aprovechar el panel solar.\nTemperatura: ${temperatura}°C\nHumedad: ${humedad}%\nPresión: ${presion} hPa\nDescripción: ${descripcionClima}\nEs de ${esDeDia}.`;
    }
  } else {
    mensaje = `El clima está soleado. Buen momento para aprovechar el panel solar.\nTemperatura: ${temperatura}°C\nHumedad: ${humedad}%\nPresión: ${presion} hPa\nDescripción: ${descripcionClima}\nEs de ${esDeDia}.`;
  }

  const destinatarios = ['ferochoaoliveros@gmail.com', 'bryan.sanchezorozco@gmail.com', 'smartsolarpanel1@gmail.com','davidxinso@gmail.com','Elizaof7@gmail.com']; //Elizaof7@gmail.com
  const mailOptions = {
    from: 'smartsolarpanel1@gmail.com',
    to: destinatarios,
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
    const API_KEY = '19a8eb642dc7b4a5c9c4a91f809713f3';
    const lat = 20.6597;
    const lon = -103.3496;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=es`);
    
    if (!response.ok) {
      console.error('Error en la solicitud API:', response.statusText);
      return;
    }

    const data = await response.json();
    const clima = data.weather[0].description.toLowerCase();
    
    if (clima.includes('soleado') || clima.includes('cielo claro')) {
      await enviarNotificacion('soleado', data);
    } else if (clima.includes('lluvioso') || clima.includes('nublado') || clima.includes('nubes')) {
      await enviarNotificacion('nublado', data);
    } else {
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

  console.log('Email ingresado:', email);
  console.log('Password ingresada:', password);

  if (!email || !password) {
    return res.status(400).send('Email y contraseña son requeridos');
  }

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', email)
      .single();

    console.log('Resultado de Supabase:', user, error);

    if (error || !user) {
      return res.status(401).send('Correo o contraseña incorrectos');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    console.log('Comparación de contraseñas:', passwordMatch);

    if (!passwordMatch) {
      return res.status(401).send('Correo o contraseña incorrectos');
    }

    req.session.userId = user.id;
    res.redirect('/Estadisticas.html');
  } catch (err) {
    console.error('Error al buscar el usuario en Supabase:', err);
    res.status(500).send('Error en la base de datos');
  }
});

// Variables para almacenar datos recibidos
let panelData = { servoh: 90, servov: 90, temperature: 27, battery: 32, batteryDuration: 43, humidity: 24 };

// Ruta para recibir datos de Arduino
app.post('/update-stats', (req, res) => {
  panelData = req.body;
  console.log("Datos actualizados:", panelData);
  res.send("Datos actualizados correctamente");
});

// Ruta para obtener datos en tiempo real
app.get('/get-stats', (req, res) => {
  res.json(panelData);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  verificarClima();
  setInterval(verificarClima, 300000); //setInterval(verificarClima, 300000);
});
