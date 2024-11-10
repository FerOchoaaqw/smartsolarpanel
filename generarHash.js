const bcrypt = require('bcryptjs');

async function encriptarContraseña(contraseña) {
  const hash = await bcrypt.hash(contraseña, 8);
  console.log('Contraseña encriptada:', hash);
}

encriptarContraseña('SmartSolarPanel'); // Aqui se pone la contraseña para el cliente del panel
