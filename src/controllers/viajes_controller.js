// IMPORTAMOS LOS MÓDULOS
const viajeService = require("../services/viaje_service");

// FUNCIÓN PARA CREAR UN VIAJE
const crearViaje = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    const nuevoViaje = await viajeService.crearViaje(userId, req.body);
    res.status(201).json({ mensaje: "Viaje creado correctamente", viaje: nuevoViaje });
  } catch (error) {
    console.error("Error en crearViaje:", error);
    res.status(error.message.includes("sesión") ? 401 : 500)
      .json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA LISTAR LOS VIAJES DEL USUARIO
const listarViajes = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    const viajes = await viajeService.listarViajesDeUsuario(userId, req.user.rol);
    res.status(200).json(viajes);
  } catch (error) {
    res.status(error.message.includes("sesión") ? 401 : 500)
      .json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA OBTENER UN VIAJE POR ID
const obtenerViaje = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    const viaje = await viajeService.obtenerViaje(req.params.id, userId, req.user.rol);
    res.status(200).json(viaje);
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404
      : error.message.includes("acceso") ? 403 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA EDITAR UN VIAJE
const editarViaje = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    const viaje = await viajeService.editarViaje(req.params.id, userId, req.user.rol, req.body);
    res.status(200).json({ mensaje: "Viaje modificado con éxito", viaje });
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404
      : error.message.includes("creador") ? 403 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA ELIMINAR UN VIAJE
const eliminarViaje = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    await viajeService.eliminarViaje(req.params.id, userId, req.user.rol);
    res.status(200).json({ mensaje: "Viaje eliminado correctamente" });
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404
      : error.message.includes("creador") ? 403 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA AÑADIR UN USUARIO AL VIAJE
const añadirUsuario = async (req, res) => {
  try {
    const viaje = await viajeService.añadirUsuario(req.params.id, req.body.email);
    res.status(200).json({ mensaje: "Usuario añadido correctamente", viaje });
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404
      : error.message.includes("ya está") ? 400 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA ELIMINAR UN USUARIO DEL VIAJE
const eliminarUsuario = async (req, res) => {
  try {
    const viaje = await viajeService.eliminarUsuario(req.params.id, req.body.email);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente", viaje });
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404
      : error.message.includes("no está") || error.message.includes("creador") ? 400 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA ABANDONAR UN VIAJE
const abandonarViaje = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    await viajeService.abandonarViaje(req.params.id, userId);
    res.status(200).json({ mensaje: "Has abandonado el viaje correctamente" });
  } catch (error) {
    const status = error.message.includes("creador") || error.message.includes("no está") ? 400 : 500;
    res.status(status).json({ mensaje: error.message });
  }
};

// FUNCIÓN PARA UNIRSE A UN VIAJE POR CÓDIGO
const unirsePorCodigo = async (req, res) => {
  try {
    const userId = viajeService.extraerUserId(req);
    const viaje = await viajeService.unirsePorCodigo(req.body.codigo, userId);
    res.status(200).json({ message: "Te has unido al viaje con éxito", viaje });
  } catch (error) {
    console.error("Error en unirsePorCodigo:", error);
    const status = error.message.includes("obligatorio") || error.message.includes("Ya estás") ? 400
      : error.message.includes("no existe") ? 404
      : error.message.includes("autorizado") ? 401 : 500;
    res.status(status).json({ message: error.message });
  }
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  crearViaje,
  listarViajes,
  obtenerViaje,
  editarViaje,
  eliminarViaje,
  añadirUsuario,
  eliminarUsuario,
  abandonarViaje,
  unirsePorCodigo,
};