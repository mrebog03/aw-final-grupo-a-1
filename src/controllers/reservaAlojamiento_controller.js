//IMPORTAMOS EL SERVICIO DE RESERVAS DE ALOJAMIENTOS
const reservaService = require("../services/reservaAlojamiento_service");

//FUNCION PARA CREAR UNA RESERVA
const createReserva = async (req, res) => {
  try {
    //Extraemos la informacion necesaria para hacer una reserva
    const { alojamiento, viaje, fechaEntrada, fechaSalida, huespedes, precioTotal, estado } = req.body;

    //Extraemos el usuario de la sesion
    const usuarioReserva = reservaService.extraerUserId(req);

    //Validamos las fechas de la reserva con las fechas del viaje
    await reservaService.validarFechasConViaje(viaje, fechaEntrada, fechaSalida);

    // Creamos la reserva
    const nuevaReserva = await reservaService.crear({
      alojamiento, viaje, usuarioReserva, fechaEntrada, fechaSalida,
      huespedes, precioTotal, estado: estado || "pendiente"
    });

    res.status(201).json({ message: "Reserva creada con éxito", reserva: nuevaReserva });
  
  } catch (error) {
    console.error(error.message);
    const status = error.message.includes("identificar") ? 401
      : error.message.includes("no existe") ? 404
      : error.message.includes("fechas") || error.message.includes("salida") ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

//FUNCION PARA ELIMINAR UNA RESERVA
const deleteReserva = async (req, res) => {
  try {
    //Borramos una reserva buscando por id
    const reservaEliminada = await reservaService.eliminar(req.params.reservaID);
    if (!reservaEliminada) return res.status(404).json({ message: "Reserva no encontrada" });

    res.status(200).json({ message: "Reserva cancelada y eliminada con éxito" });
  
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

//FUNCION PARA MODIFICAR UNA RESERVA
const updateReserva = async (req, res) => {
  try {
    //Actualizamos la reserva
    const reservaActualizada = await reservaService.actualizar(req.params.reservaID, req.body);
    if (!reservaActualizada) return res.status(404).json({ message: "Reserva no encontrada" });

    res.status(200).json({ message: "Estado de la reserva actualizado con éxito", reserva: reservaActualizada });
  
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

//FUNCION PARA OBTENER LAS RESERVAS
const getReservas = async (req, res) => {
  try {
    //Aplicamos los filtros para mostrar una reserva
    const reservas = await reservaService.obtenerTodos(req.query);
    res.status(200).json(reservas);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  createReserva,
  deleteReserva,
  updateReserva,
  getReservas,
};