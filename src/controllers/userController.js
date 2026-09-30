// IMPORTAMOS LOS MÓDULOS
const User = require("../models/usuario");
const Viajes = require("../models/viaje");
const userService = require("../services/user_service");

// FUNCIÓN PARA REGISTRARSE
const register = async (req, res) => {
  try {
    const { nombre, email, password, confirmPassword } = req.body;

    // Comprobamos que el email no esté ya en la base de datos
    await userService.verificarEmailExiste(email);
    // Comprobamos que la contraseña y la confirmación coinciden
    userService.verificarContraseñasCoinciden(password, confirmPassword);
    // Encriptamos la contraseña para guardarla de forma segura
    const hashedPassword = await userService.encriptarContraseña(password);

    // Creamos el nuevo usuario en la base de datos
    const nuevoUsuario = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol: "Cliente",
    });

    console.log(`Usuario ${nuevoUsuario.nombre} creado con éxito`);

    // Generamos el token JWT y lo guardamos en una cookie
    userService.generarTokenYCookie(res, nuevoUsuario);

    // Devolvemos una respuesta de éxito al cliente
    res.status(201).json({ message: "Usuario creado con éxito", rol: nuevoUsuario.rol });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

// FUNCIÓN PARA INICIAR SESIÓN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscamos el usuario en la base de datos por su email
    const usuario = await userService.buscarUsuarioPorEmail(email);
    // Comprobamos que la contraseña introducida es correcta
    await userService.verificarContraseña(password, usuario.password);

    console.log(`${usuario.email} ha iniciado sesión`);

    // Generamos el token JWT y lo guardamos en una cookie
    userService.generarTokenYCookie(res, usuario);

    // Devolvemos una respuesta de éxito al cliente
    res.status(200).json({ message: "Inicio de sesión exitoso", rol: usuario.rol });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

// FUNCIÓN PARA CERRAR SESIÓN
const logout = async (req, res) => {
  try {
    // Eliminamos la cookie de sesión del cliente
    res.clearCookie("JWTtokens");

    console.log("Cierre de sesión exitoso");
    // Devolvemos una respuesta de éxito al cliente
    res.status(200).json({ message: "Cierre de sesión exitoso" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

// FUNCIÓN PARA OBTENER EL USUARIO ACTUAL
const getCurrentUser = async (req, res) => {
  try {
    // Buscamos el usuario por el id extraído del token JWT, excluyendo la contraseña
    const usuario = await User.findById(req.user.id).select("-password");
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    // Devolvemos los datos del usuario
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

// FUNCIÓN PARA OBTENER LOS VIAJES EN LOS QUE ESTOY APUNTADO
const obtenerMisViajes = async (req, res) => {
  try {
    const viajes = await Viajes.find({ usuariosApuntados: req.user.id });
    res.status(200).json(viajes);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

// EXPORTAMOS LAS FUNCIONES
module.exports = { register, login, logout, getCurrentUser, obtenerMisViajes };