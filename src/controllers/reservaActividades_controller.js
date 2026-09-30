// IMPORTAMOS LOS MÓDULOS
const reservaActividadService = require("../services/reservaActividades_service");

// FUNCIÓN PARA CREAR UNA RESERVA DE ACTIVIDAD
const createReservaActividad = async (req, res) => {
  try {
    const usuarioId = reservaActividadService.extraerUserId(req);
    const { actividad, viaje } = req.body;

    // Creamos la reserva y reducimos el cupo en el service
    const nuevaReserva = await reservaActividadService.crearReserva({
      actividadId: actividad,
      viajeId: viaje,
      usuarioId,
    });

    return res.status(201).json({ message: "Reserva de actividad creada con éxito", reserva: nuevaReserva });
  } catch (error) {
    console.error("Error en createReservaActividad:", error.message);
    const status = error.message.includes("No autorizado") ? 401
      : error.message.includes("no existe") ? 404
      : error.message.includes("Ya estás") ? 400 : 500;
    return res.status(status).json({ message: error.message });
  }
};

// FUNCIÓN PARA ELIMINAR UNA RESERVA DE ACTIVIDAD
const deleteReservaActividad = async (req, res) => {
  try {
    // Eliminamos la reserva y devolvemos el cupo en el service, validando permisos
    await reservaActividadService.eliminarReserva(req.params.id, req.user.id, req.user.rol);
    return res.status(200).json({ message: "Reserva de actividad cancelada y cupo restablecido con éxito" });
  } catch (error) {
    console.error("Error en deleteReservaActividad:", error.message);
    const status = error.message.includes("no encontrada") ? 404 
                 : error.message.includes("permiso") ? 403 : 500;
    return res.status(status).json({ message: error.message });
  }
};

// FUNCIÓN PARA OBTENER LAS RESERVAS DE ACTIVIDADES
const getReservasActividades = async (req, res) => {
  try {
    const requesterId  = req.user?.id;
    const requesterRol = req.user?.rol;
    const reservas = await reservaActividadService.obtenerTodos(req.query, requesterId, requesterRol);
    return res.status(200).json(reservas);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  createReservaActividad,
  deleteReservaActividad,
  getReservasActividades,
};