import * as apiViajes from "./modules/rest-api-viajes.mjs";
import * as htmlViajes from "./modules/html-components-viajes.mjs";

const contenedor = document.querySelector('#viajes-results');
const formularioCrear = document.getElementById('viaje-create');
const formularioUnirse = document.getElementById('viaje-join');

/**
 * Carga todos los viajes de la sesión del usuario
 */
const cargarViajes = async () => {
  try {
    const viajes = await apiViajes.obtenerViajes();
    htmlViajes.updateViajesContainer(viajes, contenedor);
  } catch (error) {
    console.error('Error al cargar los viajes:', error);
    if (contenedor) {
      contenedor.innerHTML = '<p class="error">No se pudieron cargar tus viajes. Asegúrate de haber iniciado sesión.</p>';
    }
  }
};

/**
 * Maneja el envío del formulario para crear un nuevo viaje
 */
const crearViajeHandler = async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const nuevoViaje = Object.fromEntries(formData.entries());
  
  // Forzar tipos de datos correctos antes de enviar a la API
  nuevoViaje.presupuesto = parseFloat(nuevoViaje.presupuesto) || 0;
  nuevoViaje.fechaInicio = new Date(nuevoViaje.fechaInicio);
  nuevoViaje.fechaFin = new Date(nuevoViaje.fechaFin);

  try {
    const respuesta = await apiViajes.crearViaje(nuevoViaje);
    const codigo = respuesta.viaje.codigo;
    window.alert(`¡Viaje planificado con éxito! El código de acceso es: ${codigo}`);
    form.reset();
    await cargarViajes();
  } catch (error) {
    alert("Error al guardar el viaje: " + error.message);
  }
};

const unirseViajeHandler = async (event) => {
  event.preventDefault();
  const form = event.target;
  const codigo = document.getElementById('codigoViaje').value.trim();

  try {
    await apiViajes.unirseAViaje(codigo);
    window.alert("¡Te has unido al viaje con éxito!");
    form.reset();
    await cargarViajes(); // Recarga la lista de destinos del usuario
  } catch (error) {
    alert("No se pudo unir al viaje: " + error.message);
  }
};

/**
 * Maneja los clics en los botones de eliminar dentro del contenedor
 */
const accionesContenedorHandler = async (event) => {
  const botonEliminar = event.target.closest('.boton-eliminar-viaje');
  if (!botonEliminar) return;

  const id = botonEliminar.dataset.id;
  
  if (confirm("¿Estás seguro de que quieres eliminar este viaje? Se perderán todos sus datos asociados.")) {
    try {
      await apiViajes.eliminarViaje(id);
      await cargarViajes(); // Recarga la lista de inmediato
    } catch (error) {
      alert("Error al eliminar el viaje: " + error.message);
    }
  }
};

/**
 * 5. NAVEGACIÓN Y CONFIGURACIÓN INICIAL (DOMContentLoaded)
 */
const inicializarNavegacion = () => {
  const menu = document.querySelector('#main-menu'); 
  if (!menu) return;

  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.dataset.url) {
      e.preventDefault();
      window.location.href = link.dataset.url;
    }
  });
};

inicializarNavegacion();

// --- INICIALIZACIÓN DE EVENTOS ---

if (formularioCrear) {
  formularioCrear.addEventListener('submit', crearViajeHandler);
}

if (contenedor) {
  contenedor.addEventListener('click', accionesContenedorHandler);
}

if (formularioUnirse) {
  formularioUnirse.addEventListener('submit', unirseViajeHandler);
}

// Carga inicial al entrar a la página
cargarViajes();