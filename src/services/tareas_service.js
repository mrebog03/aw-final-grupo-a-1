// IMPORTAMOS LOS MÓDULOS
const Tarea = require("../models/tarea");
const Viaje = require("../models/viaje");

// FUNCIÓN PARA OBTENER LAS TAREAS FILTRADAS POR VIAJE, ESTADO Y PERMISOS DE USUARIO
const obtenerTareas = async (query, usuarioId, rolUsuario) => {
  try {
    // Obtenemos los filtros de la consulta y configuramos el filtro de estado
    const { viaje, estado } = query;
    const filtro = {};

    if (estado === 'completada') {
      filtro.completada = true;
    } else if (estado === 'pendiente') {
      filtro.completada = false;
    }

    // Comprobamos si el usuario tiene rol de administrador
    const esAdmin = rolUsuario?.toLowerCase() === 'admin';

    // Aplicamos restricciones de viaje según el rol (el admin ve todo, el usuario solo sus viajes)
    if (esAdmin) {
      if (viaje && viaje !== 'null' && viaje !== 'undefined' && viaje !== '') {
        filtro.viaje = viaje;
      }
    } else {
      const misViajes = await Viaje.find({ usuariosApuntados: usuarioId }).select('_id');
      const misViajesIds = misViajes.map(v => v._id.toString());

      if (misViajesIds.length === 0) {
        return [];
      }

      if (viaje && viaje !== 'null' && viaje !== 'undefined' && viaje !== '') {
        if (misViajesIds.includes(viaje.toString())) {
          filtro.viaje = viaje;
        } else {
          return [];
        }
      } else {
        filtro.viaje = { $in: misViajesIds };
      }
    }

    // Buscamos las tareas con los filtros aplicados, cruzamos datos de actividad y ordenamos
    return await Tarea.find(filtro)
      .populate("actividad", "nombre categoria")
      .sort({ _id: -1 });

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA CREAR UNA NUEVA TAREA ASOCIADA A UN VIAJE
const crearTarea = async ({ viaje, actividad, descripcion }, usuarioId, rolUsuario) => {
  try {
    // SEGURIDAD: Comprobamos que el usuario tenga permiso para crear tareas en este viaje
    if (rolUsuario?.toLowerCase() !== 'admin') {
      const viajeDoc = await Viaje.findById(viaje);
      if (!viajeDoc) throw new Error("El viaje especificado no existe");
      
      const esMiembro = viajeDoc.usuariosApuntados.some(u => u.toString() === usuarioId.toString());
      if (!esMiembro) throw new Error("No tienes permiso para crear tareas en este viaje");
    }

    // Obtenemos la información necesaria y creamos la nueva tarea
    const nuevaTarea = new Tarea({ viaje, actividad, descripcion, completada: false });
    
    // Guardamos la tarea en la base de datos y devolvemos el resultado
    return await nuevaTarea.save();

  } catch (error) {
    throw new Error(error.message);
  }
};

// FUNCIÓN PARA VERIFICAR SI EL USUARIO TIENE ACCESO A LA TAREA (POR MEMBRESÍA DEL VIAJE)
const verificarAccesoTarea = async (tareaId, usuarioId, rolUsuario) => {
  const tarea = await Tarea.findById(tareaId);
  if (!tarea) throw new Error("Tarea no encontrada");

  if (rolUsuario?.toLowerCase() === 'admin') return tarea;

  const viaje = await Viaje.findById(tarea.viaje);
  if (!viaje) throw new Error("Viaje asociado no encontrado");

  const esMiembro = viaje.usuariosApuntados.some(u => u.toString() === usuarioId.toString());
  if (!esMiembro) throw new Error("No tienes permiso para modificar tareas de este viaje");

  return tarea;
};

// FUNCIÓN PARA ACTUALIZAR EL ESTADO DE COMPLETADA DE UNA TAREA POR SU ID
const cambiarEstadoTarea = async (id, completada, usuarioId, rolUsuario) => {
  try {
    // Verificamos acceso antes de actualizar
    await verificarAccesoTarea(id, usuarioId, rolUsuario);
    
    // Buscamos la tarea por ID y actualizamos su estado
    const tarea = await Tarea.findByIdAndUpdate(id, { completada }, { new: true });
    
    // Devolvemos la tarea actualizada
    return tarea;

  } catch (error) {
    throw new Error(error.message);
  }
};
// FUNCIÓN PARA ELIMINAR UNA TAREA POR SU ID
const eliminarTarea = async (id, usuarioId, rolUsuario) => {
  try {
    // Verificamos acceso antes de eliminar
    await verificarAccesoTarea(id, usuarioId, rolUsuario);
    
    // Eliminamos la tarea
    await Tarea.findByIdAndDelete(id);

  } catch (error) {
    throw new Error(error.message);
  }
};

// EXPORTAMOS LAS FUNCIONES DEL SERVICIO DE TAREAS
module.exports = { obtenerTareas, crearTarea, cambiarEstadoTarea, eliminarTarea, verificarAccesoTarea };