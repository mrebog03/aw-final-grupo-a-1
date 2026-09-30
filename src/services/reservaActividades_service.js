// IMPORTAMOS LOS MÓDULOS
const ReservaActividad = require("../models/reserva_actividad");
const Actividad = require("../models/actividad");

// FUNCIÓN PARA EXTRAER EL ID DEL USUARIO DESDE EL OBJETO DE PETICIÓN (REQ) DE FORMA SEGURA
const extraerUserId = (req) => {
  try {
    // Obtenemos el identificador correcto del usuario autenticado
    const userId = req.user?.id || null;

    // Lanzamos un error de autorización si no se encuentra el ID del usuario
    if (!userId) throw new Error("No autorizado. Inicie sesión de nuevo.");

    // Devolvemos el ID del usuario si todo ha ido bien
    return userId;

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA BUSCAR UNA ACTIVIDAD POR SU ID Y VALIDAR SU EXISTENCIA
const buscarActividad = async (actividadId) => {
  try {
    // Buscamos la actividad en la base de datos por su identificador
    const actividad = await Actividad.findById(actividadId);
    
    // Lanzamos un error si la actividad no existe
    if (!actividad) throw new Error("La actividad seleccionada no existe.");
    
    // Devolvemos la actividad encontrada si todo ha ido bien
    return actividad;

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA COMPROBAR QUE EL USUARIO NO TENGA YA UNA RESERVA PARA ESA ACTIVIDAD EN ESE VIAJE
const comprobarReservaDuplicada = async (actividadId, viajeId, usuarioId, nombreActividad) => {
  try {
    // Buscamos si ya existe un registro de reserva con los mismos datos
    const duplicada = await ReservaActividad.findOne({
      actividad: actividadId,
      viaje: viajeId,
      usuarioReserva: usuarioId,
    });
    
    // Lanzamos un error si el usuario ya se encuentra registrado en la actividad
    if (duplicada) throw new Error(`Ya estás apuntado a la actividad "${nombreActividad}" en este viaje.`);

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA CREAR UNA RESERVA Y REDUCIR EL CUPO DISPONIBLE DE LA ACTIVIDAD
const crearReserva = async ({ actividadId, viajeId, usuarioId }) => {
  try {
    // Buscamos la actividad y comprobamos existencia
    const actividad = await buscarActividad(actividadId);
    
    // VALIDACIÓN DE CUPO: Comprobamos que haya plazas disponibles
    if (actividad.capacidad <= 0) {
      throw new Error(`Lo sentimos, no quedan plazas disponibles para la actividad "${actividad.nombre}".`);
    }

    // VALIDACIÓN DE MEMBRESÍA: Comprobamos que el usuario pertenezca al viaje
    const Viaje = require("../models/viaje");
    const viaje = await Viaje.findById(viajeId);
    if (!viaje) throw new Error("El viaje seleccionado no existe.");

    const esMiembro = viaje.usuariosApuntados.some(u => u.toString() === usuarioId.toString());
    if (!esMiembro) throw new Error("No tienes permiso para reservar actividades en este viaje porque no eres miembro.");

    // Comprobamos que el usuario no esté ya apuntado
    await comprobarReservaDuplicada(actividadId, viajeId, usuarioId, actividad.nombre);

    // Creamos el nuevo registro de reserva con los datos de la actividad
    const nuevaReserva = await crear({
      actividad: actividadId,
      viaje: viajeId,
      usuarioReserva: usuarioId,
      participantes: 1,
      fechaReserva: actividad.fecha,
      precioTotal: actividad.precio,
      estado: "confirmado",
    });

    // Reducimos el cupo de la actividad en una unidad
    actividad.capacidad -= 1;
    await actividad.save();

    // ASEGURAMOS CONSISTENCIA: Añadimos la actividad al viaje si no estaba ya vinculada
    await Viaje.findByIdAndUpdate(viajeId, {
      $addToSet: { actividadesReservadas: actividadId }
    });

    // Devolvemos la reserva creada con éxito
    return nuevaReserva;

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA ELIMINAR UNA RESERVA Y DEVOLVER EL CUPO CORRESPONDIENTE A LA ACTIVIDAD
const eliminarReserva = async (id, usuarioId, rolUsuario) => {
  try {
    // Buscamos la reserva por ID para verificar su existencia
    const reserva = await ReservaActividad.findById(id);
    if (!reserva) throw new Error("Reserva de actividad no encontrada");

    // VERIFICACIÓN DE SEGURIDAD: Solo el dueño de la reserva o un admin pueden borrarla
    if (rolUsuario !== 'Admin' && reserva.usuarioReserva.toString() !== usuarioId.toString()) {
      throw new Error("No tienes permiso para cancelar esta reserva");
    }

    // Devolvemos las plazas liberadas incrementando la capacidad de la actividad
    await Actividad.findByIdAndUpdate(reserva.actividad, {
      $inc: { capacidad: reserva.participantes },
    });

    // Eliminamos el registro de la reserva de la base de datos
    await ReservaActividad.findByIdAndDelete(id);

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA CREAR UNA NUEVA RESERVA EN LA BASE DE DATOS
const crear = async (data) => {
  try {
    // Instanciamos el modelo de reserva con los datos recibidos
    const nuevaReserva = new ReservaActividad(data);
    
    // Guardamos la reserva en la base de datos y devolvemos el resultado
    return await nuevaReserva.save();

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA ELIMINAR UNA RESERVA POR SU ID
const eliminar = async (id) => {
  try {
    // Buscamos la reserva por ID y la borramos de la base de datos
    return await ReservaActividad.findByIdAndDelete(id);

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA MODIFICAR UNA RESERVA POR SU ID
const actualizar = async (id, data) => {
  try {
    // Buscamos la reserva por ID, la actualizamos con los nuevos datos y devolvemos el documento modificado
    return await ReservaActividad.findByIdAndUpdate(id, data, { new: true });

  } catch (error) {
    throw new Error(error.message);
  }
};
// FUNCIÓN PARA OBTENER TODAS LAS RESERVAS APLICANDO FILTROS OPCIONALES Y CRUZAR SUS DATOS
const obtenerTodos = async ({ viaje, usuarioReserva, estado }, requesterId, requesterRol) => {
  try {
    // Configuramos los filtros dinámicos según los parámetros recibidos
    const filtro = {};
    if (estado) filtro.estado = estado;

    const esAdmin = requesterRol === 'Admin';

    if (esAdmin) {
      if (viaje) filtro.viaje = viaje;
      if (usuarioReserva) filtro.usuarioReserva = usuarioReserva;
    } else {
      // SEGURIDAD PARA CLIENTES:
      // 1. Siempre limitamos a sus propios viajes
      const Viaje = require("../models/viaje");
      const misViajes = await Viaje.find({ usuariosApuntados: requesterId }).select('_id');
      const misViajesIds = misViajes.map(v => v._id.toString());

      if (misViajesIds.length === 0) return [];

      if (viaje) {
        if (misViajesIds.includes(viaje.toString())) {
          filtro.viaje = viaje;
        } else {
          return []; // Pide un viaje al que no pertenece
        }
      } else {
        filtro.viaje = { $in: misViajesIds };
      }

      // 2. Si pide las reservas de un usuario específico, solo permitimos si es él mismo
      if (usuarioReserva) {
        if (usuarioReserva.toString() === requesterId.toString()) {
          filtro.usuarioReserva = requesterId;
        } else {
          return []; // Intenta ver reservas de otro usuario
        }
      }
    }

    // Buscamos las reservas y hacemos el populate para traer los datos limpios de actividad, viaje y usuario
    return await ReservaActividad.find(filtro)
      .populate("actividad", "nombre descripcion precio")
      .populate("viaje", "nombre destino")
      .populate("usuarioReserva", "nombre email");

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA CANCELAR UNA RESERVA BUSCANDO POR ACTIVIDAD Y VIAJE (PARA COMPATIBILIDAD)
const cancelarReservaPorActividadYViaje = async (actividadId, viajeId, usuarioId) => {
  try {
    const reserva = await ReservaActividad.findOne({
      actividad: actividadId,
      viaje: viajeId,
      usuarioReserva: usuarioId
    });

    if (!reserva) throw new Error("No tienes una reserva para esta actividad en este viaje");

    // Usamos la lógica de eliminación existente
    await eliminarReserva(reserva._id, usuarioId, 'Cliente');

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
};

// EXPORTAMOS LAS FUNCIONES DEL SERVICIO DE TAREAS
module.exports = { crearReserva, eliminarReserva, crear, eliminar, actualizar, obtenerTodos , extraerUserId, buscarActividad, comprobarReservaDuplicada, cancelarReservaPorActividadYViaje };