// Módulo para interactuar con la API REST de gastos
// Definir la URL base para las solicitudes a la API de gastos
const baseURL = "/api/gastos";

// Función para crear un nuevo gasto enviando una solicitud POST a la API
const crearGasto = async (data) => {
  const url = `${baseURL}/`;
  // Enviar una solicitud POST a la API con los datos del gasto en formato JSON
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Error al crear el gasto');
  }
  // Devolver la respuesta JSON con los datos del gasto creado
  return await response.json();
}

// Función para obtener un gasto específico por su ID enviando una solicitud GET a la API
const obtenerGastoEspecifico = async (gastoId) => {
  const url = `${baseURL}/${gastoId}`;
  // Enviar una solicitud GET a la API para obtener los datos del gasto con el ID especificado
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Error al obtener el gasto');
  }
  // Devolver la respuesta JSON con los datos del gasto obtenido
  return await response.json();
}

// Función para actualizar un gasto existente enviando una solicitud PUT a la API
const actualizarGasto = async (gastoId, data) => {
  const url = `${baseURL}/${gastoId}`;
  // Enviar una solicitud PUT a la API con los datos actualizados del gasto en formato JSON
  const response = await fetch(url, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Error al actualizar el gasto');
  }
  // Devolver la respuesta JSON con los datos del gasto actualizado
  return await response.json();
}

// Función para eliminar un gasto enviando una solicitud DELETE a la API
const eliminarGasto = async (gastoId) => {
  const url = `${baseURL}/${gastoId}`;
  // Enviar una solicitud DELETE a la API para eliminar el gasto con el ID especificado
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Error al eliminar el gasto');
  }
  // Devolver la respuesta JSON con un mensaje de éxito o los datos del gasto eliminado
  return await response.json();
}

// Función para obtener la lista de gastos enviando una solicitud GET a la API, con opción de filtros
const obtenerGastos = async (filtros = {}) => {
  // Construir la URL con los parámetros de consulta para los filtros
  const queryParams = new URLSearchParams(filtros).toString();
  // Si hay filtros, agregar los parámetros de consulta a la URL, de lo contrario usar la URL base
  const url = queryParams ? `${baseURL}?${queryParams}` : baseURL;
  // Enviar una solicitud GET a la API para obtener la lista de gastos, aplicando los filtros si se proporcionan
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });
  
  if(response.status === 404) return [];
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  // Devolver la respuesta JSON con la lista de gastos obtenida
  return await response.json();
};

// Exportar las funciones para que puedan ser utilizadas en otros módulos
export {crearGasto, obtenerGastos, eliminarGasto, actualizarGasto, obtenerGastoEspecifico};