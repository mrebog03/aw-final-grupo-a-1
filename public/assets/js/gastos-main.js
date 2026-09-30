// Importar las funciones de los módulos de gastos y viajes
import * as apiGastos from "./modules/rest-api-gastos.mjs";
import * as htmlGastos from "./modules/html-components-gastos.mjs";
import * as apiViajes from "./modules/rest-api-viajes.mjs";
import { populateViajesSelect } from "./modules/html-components-viajes.mjs";

// Obtener los parámetros de la URL para posibles filtros
const urlParams = new URLSearchParams(window.location.search);

// Seleccionar el contenedor donde se mostrarán los gastos
const contenedor = document.querySelector('#gastos-results');

// Función para cargar los gastos desde la API y mostrarlos en el contenedor, aplicando filtros si se proporcionan
const cargarGastosHandler = async (filtros = {}) => {
  try {
    // Si no se han proporcionado filtros,  obtener el viajeId de la URL o del selector de viajes
    if (Object.keys(filtros).length === 0) {
      const selectViaje = document.getElementById("search-viaje") || document.getElementById("filtroViaje");
      
      if (selectViaje && selectViaje.value) {
        filtros.viaje = selectViaje.value;
      }
    }
    console.log('Enviando filtros a la API para cargar la tabla:', filtros);

    // Obtener la lista de gastos desde la API aplicando los filtros
    const gastos = await apiGastos.obtenerGastos(filtros);
    console.log('Gastos obtenidos:', gastos);
    // Actualizar el contenedor con la lista de gastos obtenida
    htmlGastos.updateGastosContainer(gastos, contenedor);
  } catch (error) {
    console.error('Error al cargar gastos:', error);
  }
};

// Función para crear un gasto en formato de fila de tabla a partir de un objeto gasto
const crearGastoHandler = async (event) => {
  // Evitar que el formulario se envíe de forma tradicional y recargue la página
  event.preventDefault();
  // Obtener los datos del gasto desde el formulario utilizando la función del módulo de HTML
  const gastoData = htmlGastos.getGastoDataFromForm();
  // Validar que los campos requeridos estén completos antes de enviar la solicitud a la API
  if (!gastoData.descripcion || !gastoData.cantidad || !gastoData.categoria) {
    window.alert("Por favor, completa todos los campos requeridos");
    return;
  }
  
  // Obtener el viajeId de la URL o del selector de viajes para asignarlo al gasto antes de enviarlo a la API
  let viajeId = new URLSearchParams(window.location.search).get('viajeId');  
  // Si no hay viajeId en la URL, se obtiene del selector de viajes en el formulario de creación
  if (!viajeId) {
    // Obtener el viaje del selector de viajes en el formulario de creación
    const selectViajesCrear = document.getElementById('viaje-select');
    // Asignar el viaje seleccionado en el formulario 
    if (selectViajesCrear) {
      viajeId = selectViajesCrear.value;
    }
  }
  // Asignar el viajeId al gastoData antes de enviarlo a la API para crear el gasto
  gastoData.viaje = viajeId;
  // Validar que se haya seleccionado un viaje para asignar al gasto antes de enviarlo a la API
  if (!gastoData.viaje || gastoData.viaje === "" || gastoData.viaje === "null") {
    window.alert("Por favor, selecciona un viaje para asignar este gasto.");
    return;
  }

  try {
    // Enviar una solicitud a la API para crear el gasto con los datos obtenidos del formulario
    await apiGastos.crearGasto(gastoData);
    window.alert("Gasto creado exitosamente");
    // Resetear el formulario de creación de gasto utilizando la función del módulo de HTML
    htmlGastos.resetGastoForm();
    // Recargar la lista de gastos para mostrar el nuevo gasto creado, aplicando los filtros actuales si los hay
    await cargarGastosHandler();
  } catch (error) {
    alert('Error al crear: ' + error.message);
  }
};

// Función para eliminar un gasto enviando una solicitud DELETE a la API
const eliminarGastoHandler = async (gastoId) => {
  // Mostrar una confirmación antes de eliminar el gasto
  if (!confirm('¿Eliminar este gasto?')) return;
  try {
    // Enviar una solicitud a la API para eliminar el gasto con el ID especificado
    await apiGastos.eliminarGasto(gastoId);
    // Recargar la lista de gastos para reflejar la eliminación, aplicando los filtros actuales si los hay
    await cargarGastosHandler();
  } catch (error) {
    alert('Error al eliminar: ' + error.message);
  }
};

// Función para editar un gasto y enviar los cambios a la API
const editarGastoHandler = async (gastoId) => {
  // Buscar la fila de la tabla que corresponde al gasto que se quiere editar utilizando el atributo data-gasto-id
  const fila = document.querySelector(`tr[data-gasto-id="${gastoId}"]`);
  if (!fila) return;
  // Verificar si la fila ya está en modo edición para evitar conflictos
  const boton = fila.querySelector('.boton-editar');
  const estaEditando = fila.classList.contains('editando');
  const celdas = fila.querySelectorAll('td');
  if (!estaEditando) {
    try {
      // Obtener los datos actuales del gasto desde la API para llenar los campos de edición con los valores actuales del gasto
      await apiGastos.obtenerGastoEspecifico(gastoId);
      const descripcionActual = celdas[0].textContent;
      const cantidadActual = celdas[2].textContent.replace(' €', '');
      const categoriaActual = celdas[3].textContent;
      // Reemplazar el contenido de las celdas con campos de entrada para permitir la edición del gasto
      celdas[0].innerHTML = `<input class="input-editar" value="${descripcionActual}">`;
      celdas[2].innerHTML = `<input class="input-editar" type="number" value="${cantidadActual}">`;
      celdas[3].innerHTML = `
        <select class="input-editar categoria-editar">
          <option value="Transporte" ${categoriaActual === "Transporte" ? "selected" : ""}>Transporte</option>
          <option value="Alojamiento" ${categoriaActual === "Alojamiento" ? "selected" : ""}>Alojamiento</option>
          <option value="Comida" ${categoriaActual === "Comida" ? "selected" : ""}>Comida</option>
          <option value="Actividad" ${categoriaActual === "Actividad" ? "selected" : ""}>Actividad</option>
          <option value="Otros" ${categoriaActual === "Otros" ? "selected" : ""}>Otros</option>
        </select>`;
      boton.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar`;
      fila.classList.add('editando');
      return;
    } catch (error) {
      alert("No puedes editar este gasto: " + error.message);
      return;
    }
  } // Si ya está en modo edición, se guardan los cambios
    // Obtener los nuevos valores de los campos de entrada para actualizar el gasto
    const inputs = fila.querySelectorAll('.input-editar');
    const gastoActualizado = {
      descripcion: inputs[0].value,
      cantidad: parseFloat(inputs[1].value),
      categoria: inputs[2].value
    }
    try {
      // Enviar una solicitud a la API para actualizar el gasto con los nuevos datos obtenidos de los campos de entrada
      await apiGastos.actualizarGasto(gastoId, gastoActualizado);
      // Recargar la lista de gastos para mostrar los cambios, aplicando los filtros actuales si los hay
      await cargarGastosHandler();
    } catch (error) {
      alert('Error al editar: ' + error.message);
    }
};

// Función para inicializar la navegación del menú y cargar los gastos al cargar la página
const inicializarNavegacion = () => {
  // Seleccionar el menú de navegación
  const menu = document.querySelector('.menu-area ul'); 
  if (!menu) return;

  // Agregar un evento de clic al menú para manejar la navegación entre vistas sin recargar la página
  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    if (link && link.dataset.url) {
      e.preventDefault(); 
      const destino = link.dataset.url;
      
      console.log(`Cambiando a la vista: ${destino}`);
      
      // Cambiar la URL sin recargar la página
      window.location.href = destino;
    }
  });
};

// Función para buscar gastos aplicando los filtros de búsqueda y mostrar los resultados en el contenedor
const buscarGastosHandler = async (event) => {
  event.preventDefault();
  // Obtener los datos del formulario de búsqueda utilizando FormData para extraer los valores de los campos de búsqueda
  const formBusqueda = event.target;
  // Crear un objeto FormData a partir del formulario de búsqueda para extraer los datos de los filtros
  const formData = new FormData(formBusqueda);

  // Construir un objeto de filtros a partir de los datos del formulario de búsqueda
  const filtros = {};
  const categoria = formData.get('categoria');
  const viajeSeleccionado = formData.get('viaje');
  // Obtener el viajeId de la URL para aplicarlo como filtro si está presente
  const viajeIdUrl = new URLSearchParams(window.location.search).get('viajeId');
  // Si se ha seleccionado un filtro, se añade al objeto de filtros
  if (categoria) filtros.categoria = categoria;

  if (viajeIdUrl) {
    filtros.viaje = viajeIdUrl;
  } else if (viajeSeleccionado && viajeSeleccionado.trim() !== "") {
    filtros.viaje = viajeSeleccionado;
  }

  console.log('Filtros enviados a la API:', filtros); 

  try {
    // Obtener la lista de gastos desde la API aplicando los filtros de búsqueda
    const gastosFiltrados = await apiGastos.obtenerGastos(filtros);
    // Actualizar el contenedor con la lista de gastos filtrados obtenida
    htmlGastos.updateGastosContainer(gastosFiltrados, contenedor);
  } catch (error) {
    alert('Error al buscar: ' + error.message);
  }
};

// Agregar event listener para manejar la creación del gasto al enviar el formulario de creación
document.forms["gasto-create"].addEventListener("submit", crearGastoHandler);

// Agregar event listener para manejar los clics en los botones de editar y eliminar dentro del contenedor de gastos
contenedor.addEventListener('click', async (event) => {
  if (event.target.classList.contains('boton-eliminar')) {
    eliminarGastoHandler(event.target.dataset.id);
  }
  if (event.target.classList.contains('boton-editar')) {
    editarGastoHandler(event.target.dataset.id);
  }
});



document.forms["gasto-search"].addEventListener("submit", buscarGastosHandler);

inicializarNavegacion();
cargarGastosHandler();


document.addEventListener('DOMContentLoaded', async () => {
    const selectViajes = document.getElementById('search-viaje');
    const selectViajesCrear = document.getElementById('viaje-select');
    
    const viajeId = new URLSearchParams(window.location.search).get('viajeId');

    try {
        // Pedimos los datos iniciales
        const viajes = await apiViajes.obtenerViajes();
        
        // Rellenamos el selector de creación
        if (selectViajes) {
            populateViajesSelect(viajes, selectViajes, viajeId);
        }
        if (selectViajesCrear) {
            populateViajesSelect(viajes, selectViajesCrear, viajeId);
        }
        if (viajeId) {
            await cargarGastosHandler({ viaje: viajeId });
        } else {
            await cargarGastosHandler();
        }
    } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        await cargarGastosHandler(); 
    }
});