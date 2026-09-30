const baseURL = "/api/viajes";

/**
 * Obtiene todos los viajes de la base de datos
 */
export const obtenerViajes = async () => {
  const response = await fetch(`${baseURL}/`, {
    method: 'GET',
    credentials: 'include' // Obligatorio para enviar la cookie de sesión/JWT
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener los viajes');
  }

  return await response.json();
};

/**
 * Registra un nuevo viaje
 * @param {Object} data - Datos del viaje (destino, fechaInicio, fechaFin, presupuesto)
 */
export const crearViaje = async (data) => {
  const response = await fetch(`${baseURL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear el viaje');
  }

  return await response.json();
};

/**
 * Elimina un viaje por su ID
 */
export const eliminarViaje = async (id) => {
  const response = await fetch(`${baseURL}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar el viaje');
  }

  return await response.json();
};

export const unirseAViaje = async (codigo) => {
  const response = await fetch(`${baseURL}/unirse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ codigo })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error devuelto por el servidor:", error); 
    
    // Mongoose o tu propio backend a veces devuelven '.mensaje' en lugar de '.message'
    throw new Error(error.message || error.mensaje || `Error del servidor (Status ${response.status})`);
  }

  return await response.json();
};