//IMPORTAMOS LOS MODELOS
const ReservaAlojamiento = require("../models/reserva_alojamiento");
const Viaje = require("../models/viaje");

//FUNCION PARA OBTENER EL ID DE UN USUARIO
const extraerUserId = (req) => {
  //Extrae el userId
  const userId = req.user?.id || req.user?._id || req.userId;
  if (!userId){
    throw new Error("No se pudo identificar al usuario de la sesión.");
  }
  return userId;
};

//FUNCION PARA VALIDAR LAS FECHAS CON LAS FECHAS DEL VIAJE
const validarFechasConViaje = async (viajeId, fechaEntrada, fechaSalida) => {
  //Busca las fechas en el viaje padre
  const viaje = await Viaje.findById(viajeId);
  if (!viaje){
    throw new Error("El viaje seleccionado no existe.");
  }

  //Convierte las fechas en String a formato Date
  const entrada = new Date(fechaEntrada);
  const salida = new Date(fechaSalida);

  //Comprobamos que las fechas sean coherentes y no se salgan del los limites edl viaje
  if (entrada > salida) {
    throw new Error("La fecha de salida no puede ser anterior a la fecha de entrada.");
  }
  if (entrada < new Date(viaje.fecha_inicio) || salida > new Date(viaje.fecha_fin)) {
    throw new Error("Las fechas de la reserva no coinciden con los días del viaje.");
  }
};

//FUNCION PARA CREAR UNA RESERVA
const crear = async (data) => {
  const nuevaReserva = new ReservaAlojamiento(data);
  return await nuevaReserva.save();
};

//FUNCION PARA ELIMINAR UNA RESERVA
const eliminar = async (id) => {
  return await ReservaAlojamiento.findByIdAndDelete(id);
};

//FUNCION PARA ACTUALIZAR UNA RESERVA
const actualizar = async (id, data) => {
  return await ReservaAlojamiento.findByIdAndUpdate(id, data, { new: true });
};

//FUNCION PARA OBTENER UNA RESERVA
const obtenerTodos = async ({ viaje, usuarioReserva, estado }) => {
  const filtro = {};
  if (viaje){
    filtro.viaje = viaje;
  }

  if (usuarioReserva){
    filtro.usuarioReserva = usuarioReserva;
  }

  if (estado){
    filtro.estado = estado;
  }

  return await ReservaAlojamiento.find(filtro)
    .populate("alojamiento", "nombre ciudad precio")
    .populate("viaje", "nombre destino")
    .populate("usuarioReserva", "nombre email");
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  extraerUserId,
  validarFechasConViaje,
  crear,
  eliminar,
  actualizar,
  obtenerTodos,
};