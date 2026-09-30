// IMPORTAMOS LOS MÓDULOS
const Viaje = require("../models/viaje");
const Usuario = require("../models/usuario");

// Extrae el userId del objeto req de forma segura
const extraerUserId = (req) => {
  const userId = req.user ? req.user.id : (req.usuario ? req.usuario.id : null);
  if (!userId) throw new Error("No se encontró el usuario en la sesión");
  return userId;
};

// Genera un código único aleatorio de 8 caracteres
const generarCodigo = () => {
  const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

// Busca un viaje por ID y lanza un error si no existe
const buscarViajePorId = async (id) => {
  const viaje = await Viaje.findById(id);
  if (!viaje) throw new Error("Viaje no encontrado");
  return viaje;
};

// Busca un usuario por email y lanza un error si no existe
const buscarUsuarioPorEmail = async (email) => {
  const usuario = await Usuario.findOne({ email });
  if (!usuario) throw new Error("Usuario no encontrado");
  return usuario;
};

// Verifica que el usuario es el creador del viaje
const verificarEsCreador = (viaje, userId, rolUsuario) => {
  if (rolUsuario === 'Admin') return;
  if (viaje.creadoPor.toString() !== userId.toString()) {
    throw new Error("Solo el creador puede realizar esta acción");
  }
};

// Verifica que el usuario es miembro del viaje
const verificarEsMiembro = (viaje, userId, rolUsuario) => {
  if (rolUsuario === 'Admin') return;
  const esMiembro = viaje.usuariosApuntados.some(
    (u) => u._id ? u._id.toString() === userId.toString() : u.toString() === userId.toString()
  );
  if (!esMiembro) throw new Error("No tienes acceso a este viaje");
};

// Crea un nuevo viaje y lo guarda en la base de datos
const crearViaje = async (userId, { destino, fechaInicio, fechaFin }) => {
  const nuevoViaje = new Viaje({
    titulo: destino,
    fecha_inicio: new Date(fechaInicio),
    fecha_fin: new Date(fechaFin),
    usuariosApuntados: [userId],
    creadoPor: userId,
    codigo: generarCodigo(),
  });
  await nuevoViaje.save();
  return nuevoViaje;
};

// Devuelve todos los viajes en los que el usuario está apuntado
const listarViajesDeUsuario = async (userId, rolUsuario) => {
  if (rolUsuario === 'Admin') {
    return await Viaje.find()
      .populate("usuariosApuntados", "nombre email");
  }
  return await Viaje.find({ usuariosApuntados: userId })
    .populate("usuariosApuntados", "nombre email");
};

// Devuelve un viaje completo verificando que el usuario tenga acceso
const obtenerViaje = async (id, userId, rolUsuario) => {
  const viaje = await Viaje.findById(id)
    .populate("usuariosApuntados", "nombre email")
    .populate("creadoPor", "nombre email");
  if (!viaje) throw new Error("Viaje no encontrado");
  verificarEsMiembro(viaje, userId, rolUsuario);
  return viaje;
};

// Edita los campos del viaje si el usuario es el creador
const editarViaje = async (id, userId, rolUsuario, campos) => {
  const viaje = await buscarViajePorId(id);
  verificarEsCreador(viaje, userId, rolUsuario);

  const { titulo, descripcion, fecha_inicio, fecha_fin } = campos;
  if (titulo) viaje.titulo = titulo;
  if (descripcion) viaje.descripcion = descripcion;
  if (fecha_inicio) viaje.fecha_inicio = fecha_inicio;
  if (fecha_fin) viaje.fecha_fin = fecha_fin;

  await viaje.save();
  return viaje;
};

// Elimina un viaje si el usuario es el creador
const eliminarViaje = async (id, userId, rolUsuario) => {
  const viaje = await buscarViajePorId(id);
  verificarEsCreador(viaje, userId, rolUsuario);
  await viaje.deleteOne();
};

// Añade un usuario al viaje por su email
const añadirUsuario = async (id, email) => {
  const viaje = await buscarViajePorId(id);
  const usuario = await buscarUsuarioPorEmail(email);

  const yaApuntado = viaje.usuariosApuntados.some(
    (u) => u.toString() === usuario._id.toString()
  );
  if (yaApuntado) throw new Error("El usuario ya está apuntado");

  viaje.usuariosApuntados.push(usuario._id);
  await viaje.save();
  return viaje;
};

// Elimina un usuario del viaje por su email
const eliminarUsuario = async (id, email) => {
  const viaje = await buscarViajePorId(id);
  const usuario = await buscarUsuarioPorEmail(email);

  const apuntado = viaje.usuariosApuntados.some(
    (u) => u.toString() === usuario._id.toString()
  );
  if (!apuntado) throw new Error("El usuario no está apuntado");

  const esCreador = viaje.creadoPor.toString() === usuario._id.toString();
  if (esCreador) throw new Error("No se puede eliminar al creador");

  viaje.usuariosApuntados = viaje.usuariosApuntados.filter(
    (u) => u.toString() !== usuario._id.toString()
  );
  await viaje.save();
  return viaje;
};

// Elimina al usuario actual del viaje
const abandonarViaje = async (id, userId) => {
  const viaje = await buscarViajePorId(id);

  const esCreador = viaje.creadoPor.toString() === userId.toString();
  if (esCreador) throw new Error("El creador no puede abandonar el viaje");

  const estaApuntado = viaje.usuariosApuntados.some(
    (u) => u.toString() === userId.toString()
  );
  if (!estaApuntado) throw new Error("El usuario no está apuntado en este viaje");

  viaje.usuariosApuntados = viaje.usuariosApuntados.filter(
    (u) => u.toString() !== userId.toString()
  );
  await viaje.save();
};

// Añade al usuario actual al viaje usando un código de acceso
const unirsePorCodigo = async (codigo, userId) => {
  if (!codigo) throw new Error("El código de acceso es obligatorio");

  const viaje = await Viaje.findOne({ codigo: codigo.trim().toUpperCase() });
  if (!viaje) throw new Error("El código de viaje no existe o no es válido");

  const yaApuntado = viaje.usuariosApuntados.some(
    (u) => u.toString() === userId.toString()
  );
  if (yaApuntado) throw new Error("Ya estás apuntado a este viaje");

  viaje.usuariosApuntados.push(userId);
  await viaje.save();
  return viaje;
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  extraerUserId,
  crearViaje,
  listarViajesDeUsuario,
  obtenerViaje,
  editarViaje,
  eliminarViaje,
  añadirUsuario,
  eliminarUsuario,
  abandonarViaje,
  unirsePorCodigo,
};