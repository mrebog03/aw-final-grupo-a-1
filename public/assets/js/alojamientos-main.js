//IMPORTAMOS DEPENDENCIAS
import * as apiAlojamientos from "./modules/rest-api-alojamientos.mjs";
import * as htmlAlojamientos from "./modules/html-components-alojamientos.mjs";
import * as apiViajes from "./modules/rest-api-viajes.mjs";

//Capturar parametros barra de direcciones
const urlParams = new URLSearchParams(window.location.search);

//Elementos principales de la vista
const contenedor = document.querySelector('.resultados-alojamientos');
const searchForm = document.getElementById('searchForm');
const formCreacion = document.forms["alojamiento-create"];

//Elementos del panel de reservas
const panelReserva = document.getElementById('panel-reserva');
const selectViajes = document.getElementById('reserva-viaje');
const formReserva = document.getElementById('form-reserva-alojamiento');

//FUNCINO PARA CARGAR LOS ALOJAMIENTOS
const cargarAlojamientos = async (queryString = "") => {
  try {
    //Pide los datos al backend
    const alojamientos = await apiAlojamientos.obtenerAlojamientos(queryString);
    htmlAlojamientos.updateAlojamientosContainer(alojamientos || [], contenedor);
  } catch (error) {
    console.log("Estado: No hay alojamientos o error en el servidor.");
    htmlAlojamientos.updateAlojamientosContainer([], contenedor);
  }
};

//FUNCION PARA CREAR UN ALOJAMIENTO CON LOS DATOS NECESARIOS
const crearAlojamientoHandler = async (event) => {
  event.preventDefault();
  const alojamientoData = htmlAlojamientos.getAlojamientoDataFromForm();

  //Validacion de campos obligatorios 
  if (!alojamientoData.nombre || !alojamientoData.ciudad || isNaN(alojamientoData.capacidad) ||
      !alojamientoData.direccion || isNaN(alojamientoData.precioNoche)) {
    window.alert("Debe completar al menos el Nombre, la Ciudad y una Capacidad valida.");
    return;
  }
  
  try {
    await apiAlojamientos.crearAlojamiento(alojamientoData);
    window.alert("Alojamiento creado exitosamente");
    htmlAlojamientos.resetAlojamientoForm();
    await cargarAlojamientos();
  
  } catch (error) {
    alert('Error al crear: ' + error.message);
  }
};

//FUNCION PARA ELIMINAR UN ALOJAMIENTO PIDIENDO CONFIRMACION
const eliminarAlojamientoHandler = async (alojamientoId) => {
  if (!confirm('¿Seguro de que quiere eliminar este alojamiento?')){
    return;
  }
  try {
    await apiAlojamientos.eliminarAlojamiento(alojamientoId);
    await cargarAlojamientos();
  } catch (error) {
    alert('Error al eliminar: ' + error.message);
  }
};

//FUNCION PARA MODIFICAR UN ALOJAMIENTO PIDIENDO DATOS DESDE EL NAVEGADOR
const editarAlojamientoHandler = async (alojamientoId) => {
  const nuevoNombre = prompt('Nuevo nombre (deja en blanco para no cambiar):');
  const nuevaCiudad = prompt('Nueva ciudad (deja en blanco para no cambiar):');
  const nuevaCapacidad = prompt('Nueva capacidad:');
  const nuevosExtras = prompt('Nuevos extras separados por coma (ej: Wifi, Piscina):');
  
  if (nuevoNombre === null && nuevaCiudad === null && nuevaCapacidad === null && nuevosExtras === null){
    return;
  }

  //Añade los datos que realmente se han escrito y los que no, los conserva
  const dataActualizada = {};
  if (nuevoNombre){
    dataActualizada.nombre = nuevoNombre;
  }

  if (nuevaCiudad){
    dataActualizada.ciudad = nuevaCiudad;
  }

  if (nuevaCapacidad){
    dataActualizada.capacidad = parseInt(nuevaCapacidad);
  }

  if (nuevosExtras){
    dataActualizada.extras = nuevosExtras.split(',').map(e => e.trim());
  }

  try {
    await apiAlojamientos.actualizarAlojamiento(alojamientoId, dataActualizada);
    await cargarAlojamientos();
  
  } catch (error) {
    alert('Error al editar: ' + error.message);
  }
};

//FUNCION PARA MOSTRAR EL PANEL DE RESERVA CUANDO SE DA AL BOTON EN LA TABLA
const mostrarPanelReserva = async (alojamientoId, precioNoche, capacidad) => {
  if (!panelReserva || !selectViajes){
    return;
  }
  
  //Añade datos del alojameinto en el formulario
  document.getElementById('reserva-alojamiento-id').value = alojamientoId;
  formReserva.dataset.precioNoche = precioNoche;
  document.getElementById('reserva-huespedes').value = capacidad;
  document.getElementById('reserva-precio').value = "";

  //Muestra el panel de reserva y baja hasta el
  panelReserva.style.display = 'block';
  panelReserva.scrollIntoView({ behavior: 'smooth' });

  //Carga los viajes del usuario para el campo select
  try {
    const viajes = await apiViajes.obtenerViajes();
    selectViajes.innerHTML = '<option value="" selected disabled>Selecciona tu viaje...</option>';
    
    if (viajes.length === 0) {
      selectViajes.innerHTML = '<option value="" disabled>No tienes viajes creados</option>';
      return;
    }

    viajes.forEach(viaje => {
      const option = document.createElement('option');
      option.value = viaje._id;
      option.textContent = viaje.titulo;
      selectViajes.appendChild(option);
    });

  } catch (error) {
    selectViajes.innerHTML = '<option value="" disabled>Error al cargar viajes</option>';
  }
};

//FUNCION PARA OCULTAR BOTONOES DE ADMIN AL CLIENTE
const aplicarPermisosUI = () => {
  const rol = localStorage.getItem('rol');
  if (rol?.toLowerCase() !== 'admin') {
    document.querySelectorAll('[data-admin-only]')
      .forEach(el => el.style.display = 'none');
  }
};

//FUNCION PARA INICIAR LA NAVEGACION
const inicializarNavegacion = () => {
  const menu = document.querySelector('.menu-area ul');
  if (!menu) return;

  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    if (link && link.dataset.url) {
      e.preventDefault();
      const destino = link.dataset.url;
      console.log(`Cambiando a la vista: ${destino}`);
      window.location.href = destino;
    }
  });
};


////////////////////////////// LISTENERS //////////////////////////////

//CREACION ALOJAMIENTO
if (formCreacion) {
  formCreacion.addEventListener("submit", crearAlojamientoHandler);
}

//BUSCADOR
if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    //Recoge los valores introducidos
    const nombre = document.getElementById('nombreBusqueda').value; 
    const ciudad = document.getElementById('ciudad').value;
    const capacidad = document.getElementById('capacidad').value;
    const extrasCheckboxes = document.querySelectorAll('input[name="extrasBusqueda"]:checked');
    const extrasSeleccionados = Array.from(extrasCheckboxes).map(cb => cb.value);
    
    //Crea la URL de busqueda
    const params = new URLSearchParams();
    if (nombre){
      params.append('nombre', nombre);
    }
    if (ciudad){
      params.append('ciudad', ciudad);
    }
    if (capacidad){
      params.append('capacidad', capacidad);
    }
    if (extrasSeleccionados.length > 0) {
      params.append('extras', extrasSeleccionados.join(','));
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    cargarAlojamientos(queryString);
  });
}

if (contenedor) {
  contenedor.addEventListener('click', async (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const id = target.dataset.id;
    const precioNoche = target.dataset.precio;
    const capacidad = target.dataset.capacidad;

    if (target.classList.contains('boton-eliminar')) {
      eliminarAlojamientoHandler(id);
    }
    
    if (target.classList.contains('boton-editar')) {
      editarAlojamientoHandler(id);
    }

    if (target.classList.contains('boton-reservar')) {
      mostrarPanelReserva(id, precioNoche, capacidad);
    }
  });
}

//Cerrar panel reserva
const btnCerrarPanel = document.getElementById('btn-cerrar-panel');
if (btnCerrarPanel && panelReserva) {
  btnCerrarPanel.addEventListener('click', () => {
    panelReserva.style.display = 'none';
  });
}

//Enviar formulario reserva
if (formReserva) {
  formReserva.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const reservaData = {
      alojamiento: document.getElementById('reserva-alojamiento-id').value,
      viaje: document.getElementById('reserva-viaje').value,
      fechaEntrada: document.getElementById('reserva-entrada').value,
      fechaSalida: document.getElementById('reserva-salida').value,
      huespedes: parseInt(document.getElementById('reserva-huespedes').value),
      precioTotal: parseFloat(document.getElementById('reserva-precio').value)
    };

    try {
      await apiAlojamientos.crearReservaAlojamiento(reservaData);
      alert('¡Reserva completada con éxito!');
      if (panelReserva) panelReserva.style.display = 'none';
      formReserva.reset();
    } catch (error) {
      alert('Reserva denegada: ' + error.message);
    }
  });
}

////////////////////////// Calculos precio //////////////////////////
const calcularPrecioTotal = () => {
  const entrada = document.getElementById('reserva-entrada').value;
  const salida = document.getElementById('reserva-salida').value;
  const inputPrecioTotal = document.getElementById('reserva-precio');
  const precioNoche = parseFloat(formReserva.dataset.precioNoche);

  if (entrada && salida) {
    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);

    if (fechaSalida > fechaEntrada) {
      const diferenciaTiempo = fechaSalida.getTime() - fechaEntrada.getTime();
      
      const noches = diferenciaTiempo / (1000 * 3600 * 24); 
      
      inputPrecioTotal.value = (noches * precioNoche).toFixed(2);
    } else {
      inputPrecioTotal.value = "";
    }
  }
};

document.getElementById('reserva-entrada').addEventListener('change', calcularPrecioTotal);
document.getElementById('reserva-salida').addEventListener('change', calcularPrecioTotal);

inicializarNavegacion();
cargarAlojamientos();
aplicarPermisosUI();