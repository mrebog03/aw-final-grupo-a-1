// IMPORTAMOS LOS MÓDULOS
const tareasService = require("../services/tareas_service");
// FUNCIÓN PARA OBTENER LAS TAREAS CON FILTROS APLICANDO RESTRICCIONES DE ROL Y USUARIO
const getTareas = async (req, res) => {
  try {
    // Inicializamos las variables de identidad y rol del usuario por defecto
    let usuarioId = null;
    let rolUsuario = 'cliente';

    // Extraemos la información del usuario autenticado si existe en la petición
    if (req.user) {
      usuarioId = req.user.id;
      rolUsuario = req.user.rol || 'cliente';
    }

    // Solicitamos al servicio el listado de tareas procesadas bajo los criterios correspondientes
    const tareas = await tareasService.obtenerTareas(req.query, usuarioId, rolUsuario);
    
    // Devolvemos el listado de tareas obtenido si todo ha ido bien
    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el listado de tareas", error: error.message });
  }
};

// FUNCIÓN PARA CREAR UNA NUEVA TAREA A TRAVÉS DEL SERVICIO
const crearTarea = async (req, res) => {
  try {
    // Enviamos la información del cuerpo de la petición y datos de sesión al servicio
    const tareaGuardada = await tareasService.crearTarea(req.body, req.user.id, req.user.rol);
    
    // Devolvemos una respuesta de éxito con la tarea guardada si todo ha ido bien
    res.status(201).json(tareaGuardada);
  } catch (error) {
    const status = error.message.includes("permiso") ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

// FUNCIÓN PARA MARCAR UNA TAREA COMO COMPLETADA CAMBIANDO SU ESTADO A VERDADERO
const marcarCompletada = async (req, res) => {
  try {
    // Solicitamos al servicio la actualización del estado de la tarea pasando su ID, el valor true y datos de sesión
    const tarea = await tareasService.cambiarEstadoTarea(req.params.id, true, req.user.id, req.user.rol);
    
    // Devolvemos la tarea actualizada con éxito si todo ha ido bien
    res.status(200).json(tarea);
  } catch (error) {
    const status = error.message === "Tarea no encontrada" ? 404 
                 : error.message.includes("permiso") ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};

// FUNCIÓN PARA MARCAR UNA TAREA COMO PENDIENTE CAMBIANDO SU ESTADO A FALSO
const marcarPendiente = async (req, res) => {
  try {
    // Solicitamos al servicio la actualización del estado de la tarea pasando su ID, el valor false y datos de sesión
    const tarea = await tareasService.cambiarEstadoTarea(req.params.id, false, req.user.id, req.user.rol);
    
    // Devolvemos la tarea actualizada con éxito si todo ha ido bien
    res.status(200).json(tarea);
  } catch (error) {
    const status = error.message === "Tarea no encontrada" ? 404 
                 : error.message.includes("permiso") ? 403 : 400;
    res.status(status).json({ message: error.message });
  }
};
// FUNCIÓN PARA ELIMINAR UNA TAREA POR SU ID A TRAVÉS DEL SERVICIO
const eliminarTarea = async (req, res) => {
  try {
    // Solicitamos al servicio la remoción definitiva de la tarea usando el identificador recibido y datos de sesión
    await tareasService.eliminarTarea(req.params.id, req.user.id, req.user.rol);
    
    // Devolvemos una respuesta de éxito confirmando la eliminación si todo ha ido bien
    res.status(200).json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    const status = error.message === "Tarea no encontrada" ? 404 
                 : error.message.includes("permiso") ? 403 : 500;
    res.status(status).json({ message: error.message });
  }
};

// FUNCIÓN PARA ACTUALIZAR EL ESTADO DE COMPLETADA DE UNA TAREA CON LOS DATOS DE LA PETICIÓN
const actualizarTarea = async (req, res) => {
  try {
    // Solicitamos al servicio modificar el estado de la tarea con el nuevo valor booleano y datos de sesión
    const tarea = await tareasService.cambiarEstadoTarea(req.params.id, req.body.completada, req.user.id, req.user.rol);
    
    // Devolvemos la tarea modificada con éxito si todo ha ido bien
    res.status(200).json(tarea);
  } catch (error) {
    const status = error.message === "Tarea no encontrada" ? 404 
                 : error.message.includes("permiso") ? 403 : 500;
    res.status(status).json({ message: error.message });
  }
};

// EXPORTAMOS LAS FUNCIONES DEL CONTROLADOR DE TAREAS
module.exports = { getTareas, crearTarea, marcarCompletada, marcarPendiente, eliminarTarea, actualizarTarea };