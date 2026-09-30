// Función para crear una notificación visual
const createNotification = (msg) => {
  const span = document.createElement('span');
  span.innerText = msg;
  return span; 
};

// Función para crear una tarjeta de viaje
const crearTarjetaViaje = (viaje) => {
  // Crear un contenedor para la tarjeta de viaje
  const filaViaje = document.createElement('div');
  filaViaje.className = 'viaje-item'; 

  // Formatear las fechas de inicio y fin del viaje
  const fInicio = viaje.fecha_inicio ? new Date(viaje.fecha_inicio).toLocaleDateString() : 'Sin fecha';
  const fFin = viaje.fecha_fin ? new Date(viaje.fecha_fin).toLocaleDateString() : 'Sin fecha';
  
  // Rellenar el contenido de la tarjeta con el título del viaje y las fechas
  filaViaje.innerHTML = `
    <i class="fa-solid fa-map-location-dot"></i>
    <strong>${viaje.titulo}</strong>
    <p>(${fInicio} - ${fFin})</p>
  `;
  return filaViaje;
};

// Exportar las funciones para su uso en otros módulos
export {createNotification, crearTarjetaViaje};