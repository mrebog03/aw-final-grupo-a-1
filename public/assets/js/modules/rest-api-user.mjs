// URL base para las llamadas a la API de usuario
const baseURL = '/api/user';

// Función para registrar un nuevo usuario
const register = async (data) => {
  const url = `${baseURL}/register`;
  // Realizar una solicitud POST a la API con los datos del nuevo usuario
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  // Obtener la respuesta de la API, que incluye el rol del usuario registrado
  const responseData = await response.json();
  // Si la respuesta incluye un rol, almacenarlo en localStorage para su uso posterior
  if (responseData.rol) {
    localStorage.setItem('rol', responseData.rol);
  }
  // Devolver la respuesta de la API al módulo que llamó a esta función
  return responseData;
}

// Función para iniciar sesión con un usuario existente
const login = async (data) => {
  const url = `${baseURL}/login`;
  // Realizar una solicitud POST a la API con los datos de inicio de sesión del usuario
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
    throw new Error(error.message);
  }
  // Obtener la respuesta de la API, que incluye el rol del usuario autenticado
  const responseData = await response.json();
  // Si la respuesta incluye un rol, almacenarlo en localStorage para su uso posterior
  if (responseData.rol) {
    localStorage.setItem('rol', responseData.rol);
  }
  // Devolver la respuesta de la API al módulo que llamó a esta función
  return responseData;
}

// Función para cerrar sesión del usuario actual
const logout = async () => {
  const url = `${baseURL}/logout`;
  // Realizar una solicitud POST a la API para cerrar la sesión del usuario actual
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  // Eliminar el rol del usuario almacenado en localStorage, ya que el usuario ha cerrado sesión
  localStorage.removeItem('rol');
  // Devolver la respuesta de la API al módulo que llamó a esta función
  return response.json();
}

// Función para obtener los datos del usuario actualmente autenticado
const getCurrentUser = async () => {
  const url = `${baseURL}/profile`;
  // Realizar una solicitud GET a la API para obtener los datos del usuario actualmente autenticado
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error (error.message);
  }
  // Devolver la respuesta de la API, que incluye los datos del usuario autenticado
  return response.json();
}

// Función para obtener los viajes asociados al usuario actualmente autenticado
const obtenerMisViajes = async () => {
  const response = await fetch(`${baseURL}/viajes`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error (error.message || 'Error al obtener los viajes');
  }
  // Devolver la respuesta de la API, que incluye la lista de viajes asociados al usuario autenticado
  return response.json();
}

// Exportar las funciones para que puedan ser utilizadas en otros módulos
export  {register, login, logout, getCurrentUser, obtenerMisViajes};