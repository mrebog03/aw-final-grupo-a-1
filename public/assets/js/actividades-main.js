import * as apiActividades from "./modules/rest-api-actividades.mjs";
import * as htmlActividades from "./modules/html-components-actividades.mjs";
import * as apiUser from "./modules/rest-api-user.mjs";

// CAPTURA DE LOS ELEMENTOS REQUERIDOS DEL DOM
const contenedor = document.querySelector('#actividades-results');
const formularioCrear = document.getElementById('actividad-create');
const botonFormulario = document.getElementById('btn-guardar-actividad');
const tituloFormulario = document.getElementById('titulo-formulario');

// EXTRACCIÓN DE IDENTIFICADORES DESDE LOS PARÁMETROS DE LA URL
const params = new URLSearchParams(window.location.search);
const viajeId = params.get('viajeId'); 
const editarActividadId = params.get('actividadId');

// FUNCIÓN PRINCIPAL PARA CARGAR LAS ACTIVIDADES CON FILTROS Y ORDENACIÓN
const cargarActividades = async () => {
  try {
    // Leemos el identificador del viaje y las opciones de ordenación actuales desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const viajeId = urlParams.get('viajeId');
    
    const sort = urlParams.get('sort') || 'fecha';
    const direction = urlParams.get('direction') || 'asc';

    // Construimos el objeto de configuración con los criterios de filtrado recolectados
    const filtros = {};
    if (viajeId) filtros.viaje = viajeId;
    filtros.sort = sort;
    filtros.direction = direction;

    // Solicitamos el listado a la API mediante la función importada
    const actividades = await apiActividades.obtenerActividades(filtros);
    
    // Renderizamos las actividades dentro del contenedor correspondiente en la interfaz
    htmlActividades.updateActividadesContainer(actividades, contenedor);
    
    // Actualizamos los indicadores visuales de ordenación en la pantalla
    actualizarTriangulosVisuales(sort, direction);

    // Ejecutamos la validación de roles para ajustar los elementos visibles de la interfaz
    aplicarPermisosUI();

  } catch (error) {
    // Manejo silencioso del error para proteger la experiencia del usuario en producción
  }
};
// FUNCIÓN AUXILIAR PARA ACTUALIZAR LOS INDICADORES DE ORDENACIÓN EN LAS CABECERAS DE LA TABLA
const actualizarTriangulosVisuales = (sortActivo, direccionActiva) => {
  // Recorremos todas las cabeceras que permiten ordenación en la interfaz
  document.querySelectorAll('.columna-ordenar').forEach(th => {
    const flecha = th.querySelector('.flecha-orden');
    if (!flecha) return;

    // Modificamos el carácter visual según la columna activa y su dirección correspondiente
    if (th.dataset.orden === sortActivo) {
      flecha.textContent = direccionActiva === 'asc' ? ' ▲' : ' ▼';
    } else {
      flecha.textContent = ' ▽';
    }
  });
};

// FUNCIÓN PARA MANEJAR LAS INTERACCIONES DE ORDENACIÓN AL SELECCIONAR LAS CABECERAS DE LA TABLA
const inicializarOrdenacionTabla = () => {
  // Escuchamos los clics sobre los elementos interactivos de ordenación
  document.addEventListener('click', (e) => {
    const th = e.target.closest('.columna-ordenar');
    if (!th) return;

    e.preventDefault();

    // Extraemos los parámetros de ordenación actuales desde la URL de la página
    const nuevaColumna = th.dataset.orden;
    const urlParams = new URLSearchParams(window.location.search);
    
    const columnaActual = urlParams.get('sort') || 'fecha';
    const direccionActual = urlParams.get('direction') || 'asc';

    // Alternamos la dirección entre ascendente y descendente al repetir columna
    let nuevaDireccion = 'asc';
    if (columnaActual === nuevaColumna) {
      nuevaDireccion = direccionActual === 'asc' ? 'desc' : 'asc';
    }

    // Actualizamos la barra de direcciones del navegador sin recargar la página entera
    urlParams.set('sort', nuevaColumna);
    urlParams.set('direction', nuevaDireccion);
    window.history.pushState({}, '', `${window.location.pathname}?${urlParams.toString()}`);

    // Volvemos a consultar la lista de actividades aplicando la nueva configuración visual
    cargarActividades();
  });
};

// FUNCIÓN PARA PROCESAR EL FORMULARIO DE ACTIVIDADES TANTO EN MODO CREACIÓN COMO EN EDICIÓN
const guardarActividadHandler = async (event) => {
  event.preventDefault();
  
  // Recolectamos y estructuramos las entradas del formulario en un objeto plano
  const form = event.target;
  const formData = new FormData(form);
  const actividadData = Object.fromEntries(formData.entries());
  
  // Casteamos las entradas numéricas a sus tipos de datos correctos
  actividadData.precio = parseFloat(actividadData.precio) || 0;
  actividadData.capacidad = parseInt(actividadData.capacidad) || 0;
  
  if (viajeId) {
    actividadData.viaje = viajeId;
  }

  try {
    // Evaluamos el contexto de la página mediante la existencia de un identificador de actividad
    if (editarActividadId) {
      // Solicitamos la modificación de los datos al servicio correspondiente
      await apiActividades.actualizarActividad(editarActividadId, actividadData);
      window.alert("Actividad actualizada correctamente");
      
      // Redireccionamos al listado general respetando el contexto del viaje
      window.location.href = viajeId ? `actividades.html?viajeId=${viajeId}` : `actividades.html`;
    } else {
      // Solicitamos el registro de la nueva actividad al servicio correspondiente
      await apiActividades.crearActividad(actividadData);
      window.alert("Actividad creada correctamente");

      // Limpiamos los campos y refrescamos la vista según el flujo del usuario
      if (viajeId) {
        window.location.href = `actividades.html?viajeId=${viajeId}`;
      } else {
        form.reset();
        await cargarActividades();
      }

      form.reset();
      await cargarActividades();
    }
  } catch (error) {
    alert("Error al procesar la actividad: " + error.message);
  }
};

// FUNCIÓN PARA MANEJAR LOS CLICS EN LOS BOTONES DE LA TABLA (EDITAR, ELIMINAR, RESERVAR, CANCELAR)
const accionesTablaHandler = async (event) => {
  const target = event.target;
  const id = target.dataset.id || target.closest('button')?.dataset.id;

  const botonEliminar = target.closest('.boton-eliminar');
  const botonEditar = target.closest('.boton-editar');
  const botonReservar = target.closest('.boton-reservar');
  const botonCancelar = target.closest('.boton-cancelar');

  // Evaluamos si la interacción del usuario corresponde a la eliminación de una actividad
  if (botonEliminar) {
    if (confirm("¿Deseas eliminar esta actividad?")) {
      try {
        await apiActividades.eliminarActividad(id);
        await cargarActividades();
      } catch (error) {
        alert("Error al eliminar: " + error.message);
      }
    }
    return;
  }

  // Evaluamos si la interacción del usuario corresponde a la redirección para edición
  if (botonEditar) {
    if (viajeId) {
      window.location.href = `actividades.html?viajeId=${viajeId}&actividadId=${id}`;
    } else {
      window.location.href = `actividades.html?actividadId=${id}`;
    }
    return;
  }

  // Evaluamos si la interacción del usuario corresponde a la reserva de una plaza
  if (botonReservar) {
    if (!viajeId) {
      alert("Para apuntarte a una actividad debes acceder desde el menú interno de un viaje.");
      return;
    }

    try {    
      await apiActividades.registrarReservaActividad(id, viajeId);
      alert("¡Te has apuntado a la actividad con éxito!");
      await cargarActividades();
    } catch (error) {
      alert("No se pudo completar la reserva: " + error.message);
    }
    return;
  }
  
  // Evaluamos si la interacción del usuario corresponde al desestimiento de una reserva
  if (botonCancelar) {
    const idReserva = botonCancelar.dataset.reservaId;

    if (!confirm("¿Estás seguro de que deseas cancelar tu reserva para esta actividad?")) return;

    try {
      await apiActividades.cancelarReservaActividad(idReserva);
      alert("Reserva cancelada correctamente. Se ha liberado tu plaza.");
      await cargarActividades();
    } catch (error) {
      alert("No se pudo cancelar la reserva: " + error.message);
    }
    return;
  }
};


// FUNCIÓN PARA COMPROBAR SI ESTAMOS EN MODO EDICIÓN Y PRECARGAR LOS DATOS DE LA ACTIVIDAD EN EL FORMULARIO
const comprobarModoEdicion = async () => {
  if (!editarActividadId) return;
  
  // Modificamos los textos identificativos de la interfaz y forzamos la apertura del contenedor desplegable
  if (tituloFormulario) tituloFormulario.textContent = "Editar Actividad";
  if (botonFormulario) botonFormulario.textContent = "Guardar Cambios";

  const contenedorDetails = formularioCrear.closest('details');
  if (contenedorDetails) {
    contenedorDetails.setAttribute('open', 'true'); 
  }

  try {
    // Solicitamos la información específica de la actividad a la API
    const actividad = await apiActividades.obtenerActividadPorId(editarActividadId);
    
    // Rellenamos de forma controlada cada uno de los campos disponibles del formulario
    if (formularioCrear) {
      if (formularioCrear.elements['nombre']) formularioCrear.elements['nombre'].value = actividad.nombre || '';
      if (formularioCrear.elements['descripcion']) formularioCrear.elements['descripcion'].value = actividad.descripcion || '';
      if (formularioCrear.elements['lugar']) formularioCrear.elements['lugar'].value = actividad.lugar || '';
      if (formularioCrear.elements['precio']) formularioCrear.elements['precio'].value = actividad.precio || 0;
      if (formularioCrear.elements['capacidad']) formularioCrear.elements['capacidad'].value = actividad.capacidad || 0;
      
      // Adaptamos el formato de la marca de tiempo de la base de datos para el input de tipo datetime-local
      if (formularioCrear.elements['fecha'] && actividad.fecha) {
        formularioCrear.elements['fecha'].value = new Date(actividad.fecha).toISOString().slice(0, 16);
      }
    }
  } catch (error) {
    alert("Error al precargar los datos de la actividad: " + error.message);
  }
};

// FUNCIÓN PARA INICIALIZAR LA NAVEGACIÓN INTERNA DE LA PÁGINA MEDIANTE ATRIBUTOS DE DATOS
const inicializarNavegacion = () => {
  // Escuchamos las redirecciones sobre enlaces que utilicen el atributo personalizado data-url
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.dataset.url) {
      e.preventDefault();
      window.location.href = link.dataset.url;
    }
  }, true);
};

// FUNCIÓN PARA APLICAR RESTRICCIONES DE VISIBILIDAD A LA INTERFAZ SEGÚN EL ROL DEL USUARIO CONECTADO
const aplicarPermisosUI = () => {
  // Evaluamos el rol del usuario almacenado localmente y alternamos la visualización de las etiquetas protegidas
  const rol = localStorage.getItem('rol');
  if (rol !== 'Admin') {
    document.querySelectorAll('[data-admin-only]')
      .forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll('[data-client-only]')
      .forEach(el => el.style.display = 'none');
  }
};

// ASIGNACIÓN DE LOS MANEJADORES DE EVENTOS A LOS ELEMENTOS DEL DOM
if (formularioCrear) {
  formularioCrear.addEventListener('submit', guardarActividadHandler);
}

if (contenedor) {
  contenedor.addEventListener('click', accionesTablaHandler);
}

// INICIALIZACIÓN DE LOS PROCESOS AL CARGAR LA PÁGINA
cargarActividades();
inicializarOrdenacionTabla();
comprobarModoEdicion(); 
inicializarNavegacion();