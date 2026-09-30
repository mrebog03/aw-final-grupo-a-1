// DEFINICIÓN DE LAS RUTAS BASE PARA LOS SERVICIOS REST
const baseURL = "/api/actividades";
const baseURLReservas = "/api/reservas/actividades";

// FUNCIÓN PARA OBTENER EL LISTADO DE ACTIVIDADES FILTRADAS DESDE LA API REST
export const obtenerActividades = async (filtros = {}) => {
  // Convertimos el objeto de filtros en una cadena de parámetros de consulta para la URL
  const queryParams = new URLSearchParams(filtros).toString();
  const url = queryParams ? `${baseURL}?${queryParams}` : baseURL;

  // Realizamos la petición HTTP GET transmitiendo las credenciales de sesión vigentes
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include' 
  });

  // Validamos el estado de la respuesta y gestionamos las excepciones arrojadas por el servidor
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener las actividades');
  }

  // Devolvemos la colección de actividades deserializada si la consulta fue exitosa
  return await response.json();
};

// FUNCIÓN PARA OBTENER LOS DETALLES DE UNA ÚNICA ACTIVIDAD POR SU ID
export const obtenerActividadPorId = async (id) => {
  // Realizamos la petición HTTP GET apuntando al identificador del recurso específico
  const response = await fetch(`${baseURL}/${id}`, {
    method: 'GET',
    credentials: 'include' 
  });

  // Validamos si el servidor procesó la solicitud correctamente antes de retornar los datos
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener la actividad');
  }

  // Devolvemos el documento de la actividad obtenido de la base de datos
  return await response.json();
};

// FUNCIÓN PARA ENVIAR LOS DATOS DE UNA NUEVA ACTIVIDAD AL SERVIDOR
export const crearActividad = async (data) => {
  // Realizamos la petición HTTP POST enviando el objeto de la actividad serializado en formato JSON
  const response = await fetch(`${baseURL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  // Validamos si la inserción se completó correctamente en el almacenamiento del servidor
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear la actividad');
  }

  // Devolvemos la confirmación del nuevo documento registrado en la base de datos
  return await response.json();
};

// FUNCIÓN PARA SOLICITAR LA REMOCIÓN PERMANENTE DE UNA ACTIVIDAD POR SU ID
export const eliminarActividad = async (id) => {
  // Realizamos la petición HTTP DELETE dirigida al identificador único de la actividad
  const response = await fetch(`${baseURL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  // Validamos la respuesta devuelta por la API para confirmar el éxito de la operación
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar la actividad');
  }

  // Devolvemos el mensaje de confirmación emitido por el servicio REST
  return await response.json();
};

// FUNCIÓN PARA ACTUALIZAR LOS ATRIBUTOS DE UNA ACTIVIDAD EXISTENTE
export const actualizarActividad = async (id, data) => {
  // Realizamos la petición HTTP PUT transfiriendo las modificaciones en el cuerpo del mensaje
  const response = await fetch(`${baseURL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  // Validamos el estado de la respuesta y gestionamos las excepciones arrojadas por la API
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar la actividad');
  }

  // Devolvemos el documento de la actividad con las modificaciones aplicadas
  return await response.json();
};

// FUNCIÓN PARA SOLICITAR EL REGISTRO DE UNA RESERVA ASOCIADA A UN VIAJE Y ACTIVIDAD
export const registrarReservaActividad = async (idActividad, idViaje) => {
  // Estructuramos el objeto con los identificadores requeridos para formalizar la reserva
  const data = {
    actividad: idActividad,
    viaje: idViaje,
    participantes: 1
  };

  // Realizamos la petición HTTP POST enviando la información estructurada a la ruta de reservas
  const response = await fetch(`${baseURLReservas}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', 
    body: JSON.stringify(data)
  });

  // Validamos que el servidor haya procesado y guardado la reserva correctamente
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'No se pudo procesar la reserva');
  }

  // Devolvemos el registro del documento de reserva generado en el sistema
  return await response.json();
};

// FUNCIÓN PARA CANCELAR Y REMOVER UNA RESERVA DE ACTIVIDAD POR SU ID
export const cancelarReservaActividad = async (idReserva) => {
  // Realizamos la petición HTTP DELETE apuntando al identificador específico de la reserva
  const response = await fetch(`${baseURLReservas}/${idReserva}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  // Validamos si la operación se completó de forma correcta en el almacenamiento del servidor
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'No se pudo cancelar la reserva');
  }

  // Devolvemos el mensaje de confirmación emitido por el servicio REST de reservas
  return await response.json();
};