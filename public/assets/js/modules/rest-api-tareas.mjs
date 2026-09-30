const baseURL = "/api/tareas";

// FUNCIÓN PARA OBTENER TODAS LAS TAREAS FILTRADAS DESDE LA API REST
export const obtenerTareas = async (filtros = {}) => {
  // Convertimos el objeto de filtros en una cadena de parámetros de consulta para la URL
  const queryParams = new URLSearchParams(filtros).toString();
  const url = queryParams ? `${baseURL}?${queryParams}` : baseURL;

  // Realizamos la petición HTTP GET incluyendo las credenciales para la validación de la sesión
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include' 
  });

  // Validamos si la respuesta del servidor es correcta; de lo contrario, extraemos y lanzamos el error
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener las tareas');
  }
  
  // Devolvemos el listado de tareas deserializado si la respuesta fue exitosa
  return await response.json();
};

// FUNCIÓN PARA ENVIAR LOS DATOS DE UNA NUEVA TAREA AL SERVIDOR
export const crearTarea = async (data) => {
  // Realizamos la petición HTTP POST enviando el objeto de la tarea serializado en formato JSON
  const response = await fetch(`${baseURL}/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  // Validamos el estado de la respuesta y gestionamos las excepciones arrojadas por la API
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear la tarea');
  }
  
  // Devolvemos la confirmación del nuevo documento registrado en la base de datos
  return await response.json();
};

// FUNCIÓN PARA ACTUALIZAR LOS PARÁMETROS O EL ESTADO DE UNA TAREA EXISTENTE
export const actualizarTarea = async (tareaId, data) => {
  const url = `${baseURL}/${tareaId}`;
  
  // Realizamos la petición HTTP PUT transfiriendo las modificaciones en el cuerpo del mensaje
  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });

  // Validamos si el servidor procesó los cambios correctamente antes de retornar los datos
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar la tarea');
  }
  
  // Devolvemos el documento de la tarea con las modificaciones aplicadas
  return await response.json();
};

// FUNCIÓN PARA SOLICITAR LA REMOCIÓN PERMANENTE DE UNA TAREA POR SU ID
export const eliminarTarea = async (tareaId) => {
  const url = `${baseURL}/${tareaId}`;
  
  // Realizamos la petición HTTP DELETE apuntando al identificador del recurso específico
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });

  // Validamos si la operación se completó de forma correcta en el almacenamiento del servidor
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar la tarea');
  }
  
  // Devolvemos el mensaje de confirmación emitido por el servicio REST
  return await response.json();
};