// IMPORTAMOS LOS MÓDULOS
const User = require("../models/usuario");
const bcrypt = require("bcrypt");
const JWTtokens = require("jsonwebtoken");

// Verifica que el email no esté ya registrado en la base de datos
const verificarEmailExiste = async (email) => {
  const usuario = await User.findOne({ email });
  if (usuario) throw new Error("El email ya está registrado");
};

// Verifica que la contraseña y la confirmación coinciden
const verificarContraseñasCoinciden = (password, confirmPassword) => {
  if (password !== confirmPassword) throw new Error("Las contraseñas no coinciden");
};

// Encripta la contraseña antes de guardarla en la base de datos
const encriptarContraseña = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Busca un usuario por email y lanza un error si no existe
const buscarUsuarioPorEmail = async (email) => {
  const usuario = await User.findOne({ email });
  if (!usuario) throw new Error("Usuario no encontrado");
  return usuario;
};

// Compara la contraseña introducida con el hash guardado en la base de datos
const verificarContraseña = async (password, hash) => {
  const esCorrecta = await bcrypt.compare(password, hash);
  if (!esCorrecta) throw new Error("Contraseña incorrecta");
};

// Genera un token JWT y lo guarda en una cookie httpOnly
const generarTokenYCookie = (res, usuario) => {
  const token = JWTtokens.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.cookie("JWTtokens", token, { httpOnly: true, sameSite: "Strict" });
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  verificarEmailExiste,
  verificarContraseñasCoinciden,
  encriptarContraseña,
  buscarUsuarioPorEmail,
  verificarContraseña,
  generarTokenYCookie,
};