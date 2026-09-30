const baseURL = "/api/alojamientos";

//CREA ALOJAMIENTOS
const crearAlojamiento = async (data) => {
  const url = `${baseURL}/`;
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
    throw new Error(error.message || 'Error al crear el alojamiento');
  }
  return await response.json();
}

//ACTUALIZAR UN ALOJAMIENTO
const actualizarAlojamiento = async (alojamientoId, data) => {
  const url = `${baseURL}/${alojamientoId}`;
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
    throw new Error(error.message || 'Error al actualizar el alojamiento');
  }
  return await response.json();
}

//ELIMINAR UN ALOJAMIENTO
const eliminarAlojamiento = async (alojamientoId) => {
  const url = `${baseURL}/${alojamientoId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar el alojamiento');
  }
  return await response.json();
}

//OBTENER LA LISTA DE TODOS LOS ALOJAMIENTOS
const obtenerAlojamientos = async (query = "") => {
  const url = `${baseURL}${query}`;
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });
  
  if(response.status === 404) {
    return [];
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return await response.json();
};

//CREAR UNA RESERVA DE ALOJAMIENTO
const crearReservaAlojamiento = async (data) => {
  const url = `/api/reservas/alojamiento/`;
  
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
    throw new Error(error.message || 'Error al procesar la reserva');
  }
  
  return await response.json();
};

//CANCELAR LA RESERVA DEL ALOJAMEINTO
const cancelarReserva = async (reservaId) => {
  const url = `/api/reservas/alojamiento/${reservaId}`;
  
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al cancelar la reserva');
  }
  
  return await response.json();
};

export {
  crearAlojamiento,
  obtenerAlojamientos,
  eliminarAlojamiento,
  actualizarAlojamiento,
  crearReservaAlojamiento,
  cancelarReserva
};