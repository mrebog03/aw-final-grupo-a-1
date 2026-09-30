import * as apiTareas from "./modules/rest-api-tareas.mjs";
import * as htmlTareas from "./modules/html-components-tareas.mjs";
import * as apiActividades from "./modules/rest-api-actividades.mjs";
import * as apiViajes from "./modules/rest-api-viajes.mjs";
import { populateActividadesSelect } from "./modules/html-components-tareas.mjs";
import { populateViajesSelect } from "./modules/html-components-viajes.mjs";

// CAPTURA DEL CONTENEDOR PRINCIPAL DEL DOM
const contenedor = document.querySelector('#tareas-results');

// FUNCIÓN PARA CARGAR LAS TAREAS APLICANDO LOS FILTROS SELECCIONADOS
const cargarTareas = async (filtros = {}) => {
  try {
    // Solicitamos el listado de tareas a la API pasando el objeto de filtros
    const tareas = await apiTareas.obtenerTareas(filtros);
    
    // Renderizamos las tareas dentro del contenedor correspondiente en la interfaz
    htmlTareas.updateTareasContainer(tareas, contenedor);
  } catch (error) {
    // Manejo silencioso del error para proteger la experiencia de usuario
  }
};

// FUNCIÓN PARA PROCESAR EL FORMULARIO DE ALTA DE UNA NUEVA TAREA
const crearTareaHandler = async (event) => {
  event.preventDefault(); 
  
  // Recolectamos la información estructurada desde los campos del formulario
  const tareaData = htmlTareas.getTareaDataFromForm() || {};
  const selectViajesCrear = document.getElementById('select-viaje');

  // Determinamos el viaje asociado mediante el selector de pantalla o los parámetros de la URL
  if (selectViajesCrear && selectViajesCrear.value) {
    tareaData.viaje = selectViajesCrear.value;
  } else {
    tareaData.viaje = new URLSearchParams(window.location.search).get('viajeId');
  }

  // Validamos que el campo obligatorio de descripción contenga información
  if (!tareaData.descripcion) {
    window.alert("Por favor, introduce una descripción");
    return;
  }
  
  try {
    // Solicitamos la creación del nuevo registro a la API de tareas
    await apiTareas.crearTarea(tareaData);
    window.alert("Tarea creada exitosamente");
    
    // Restablecemos los campos del formulario utilizando el método del componente o el nativo
    if (htmlTareas.resetTareaForm) {
      htmlTareas.resetTareaForm();
    } else {
      event.target.reset();
    }
    
    // Sincronizamos la vista de la pantalla recargando el listado con los filtros vigentes
    await recargarConFiltrosPantalla();
  } catch (error) {
    alert('Error al crear: ' + error.message);
  }
};

// ASIGNACIÓN DEL MANEJADOR DE EVENTOS AL FORMULARIO DE CREACIÓN
const formularioCrear = document.getElementById("tarea-create");
if (formularioCrear) {
  formularioCrear.addEventListener("submit", crearTareaHandler);
}
// MANEJO DEL FORMULARIO DE BÚSQUEDA Y FILTRADO DE TAREAS
const formularioBusqueda = document.getElementById("tarea-search");
if (formularioBusqueda) {
  formularioBusqueda.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Recolectamos las entradas del formulario de filtrado
    const formData = new FormData(e.target);
    let estadoValor = formData.get('estado');
    let viajeValor = formData.get('viaje');    

    // Recuperamos el viaje desde los parámetros de la URL si el selector está vacío
    if (!viajeValor || viajeValor === '') {
      viajeValor = new URLSearchParams(window.location.search).get('viajeId') || '';
    }

    // Establecemos el estado "pendiente" como criterio predeterminado si no se define uno válido
    if (estadoValor === 'null' || estadoValor === null || !estadoValor || estadoValor === 'undefined') {
      estadoValor = "pendiente";
    }

    // Estructuramos el objeto de configuración con los filtros definitivos
    const filtros = {
        estado: formData.get('estado'),
        viaje: formData.get('viaje')
    };

    // Solicitamos la actualización del listado con las restricciones indicadas
    await cargarTareas(filtros);
  });
}

// DELEGACIÓN DE EVENTOS PARA LOS BOTONES DE INTERACCIÓN DE TAREAS (ESTADO Y ELIMINACIÓN)
if (contenedor) {
  contenedor.addEventListener('click', async (event) => {
    const botonCompletar = event.target.closest('.boton-completar');
    const botonMarcarPendiente = event.target.closest('.boton-completar');
    const botonEliminar = event.target.closest('.boton-eliminar');

    // Procesamos el cambio de estado (completada / pendiente) de una tarea
    if (botonCompletar) {
      event.preventDefault();

      const botonReal = event.target.closest('.boton-completar') || botonCompletar;
      const tareaId = botonReal.dataset.id;
      
      // Evaluamos la clase visual para alternar el valor booleano del estado
      const visualmenteCompletada = botonReal.classList.contains('secondary'); 
      const nuevoEstadoCompletada = visualmenteCompletada ? false : true;

      try {
        // Enviamos la actualización a la API y refrescamos la vista actual
        await apiTareas.actualizarTarea(tareaId, { completada: nuevoEstadoCompletada });
        await recargarConFiltrosPantalla();
      } catch (error) {
        alert("Error al actualizar estado: " + error.message);
      }
    }

    // Procesamos la remoción definitiva de una tarea seleccionada
    if (botonEliminar) {
      const tareaId = botonEliminar.dataset.id;
      if (confirm("¿Seguro que quieres borrar esta tarea?")) {
        try {
          // Solicitamos el borrado a la API y sincronizamos el listado en pantalla
          await apiTareas.eliminarTarea(tareaId);
          await recargarConFiltrosPantalla();
        } catch (error) {
          alert("Error al eliminar: " + error.message);
        }
      }
    }
  });
}
// FUNCIÓN PARA RECARGAR LA PANTALLA MANTENIENDO LOS FILTROS ACTUALES
const recargarConFiltrosPantalla = async () => {
  if (formularioBusqueda) {
    // Extraemos el estado actual de los filtros del formulario
    const formData = new FormData(formularioBusqueda);
    let estadoValor = formData.get('estado');
    let viajeValor = formData.get('viaje');

    // Normalizamos los valores nulos o indefinidos a cadenas vacías
    if (viajeValor === 'null' || viajeValor === null || !viajeValor) {
      viajeValor = '';
    }
    if (estadoValor === 'null' || estadoValor === null || !estadoValor) {
      estadoValor = '';
    }
    
    // Solicitamos la recarga de datos aplicando los filtros normalizados
    await cargarTareas({
      estado: estadoValor,
      viaje: viajeValor
    });

  } else {
    // Si no existe el formulario de búsqueda, cargamos el listado limpio
    await cargarTareas({});
  }
};

// FUNCIÓN PARA INICIALIZAR LA NAVEGACIÓN INTERNA DE LA PÁGINA (ENLACES CON data-url)
const inicializarNavegacion = () => {
  const menu = document.querySelector('#main-menu'); 
  if (!menu) return;

  // Delegamos el evento de clic para interceptar los enlaces con redirección personalizada
  menu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.dataset.url) {
      e.preventDefault();
      window.location.href = link.dataset.url;
    }
  });
};

// INICIALIZACIÓN DE LOS ENLACES DE NAVEGACIÓN DEL MENÚ PRINCIPAL
inicializarNavegacion();


// CONFIGURACIÓN DE ELEMENTOS Y CARGA DE DATOS AL COMPLETAR EL SQUELETO DE LA PÁGINA
document.addEventListener('DOMContentLoaded', async () => {
    const selectViajes = document.getElementById('select-viaje');
    const selectActividades = document.getElementById('select-actividades');
    const selectViajesFiltro = document.getElementById('select-viaje-filter');
    
    // Preservamos el identificador del viaje en el almacenamiento local si existe en la URL
    const viajeId = new URLSearchParams(window.location.search).get('viajeId');
    if (viajeId) {
      localStorage.setItem('viajeIdActual', viajeId);
    }

    try {
        // Solicitamos los conjuntos de datos requeridos a los servicios de actividades y viajes
        const actividades = await apiActividades.obtenerActividades({ viaje: viajeId });
        const viajes = await apiViajes.obtenerViajes(); 
        
        // Inyectamos las opciones procesadas dentro del selector de actividades
        if (selectActividades) {
            populateActividadesSelect(actividades, selectActividades);
        }
        
        // Inyectamos las opciones procesadas dentro del selector del formulario de creación
        if (selectViajes) {
            populateViajesSelect(viajes, selectViajes, viajeId);
        }

        // Inyectamos las opciones procesadas dentro del selector del formulario de filtrado
        if (selectViajesFiltro) {
            populateViajesSelect(viajes, selectViajesFiltro, viajeId);
        }
        
        // Ejecutamos la consulta inicial en pantalla respetando el contexto del viaje
        await cargarTareas({
          viaje: viajeId || '',
          estado: ''
        }); 
    } catch (error) {
        // Manejo silencioso de la excepción para entornos de producción
    }
});