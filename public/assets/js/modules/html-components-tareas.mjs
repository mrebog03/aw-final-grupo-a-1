// FUNCIÓN PARA CREAR LA ESTRUCTURA BASE DE LA TABLA DE TAREAS
export const createTareasTable = () => {
  const table = document.createElement('table');
  table.className = 'tareas-table';

  // Definimos las cabeceras estructurando las columnas de la tabla de tareas
  table.innerHTML = `
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Actividad</th>
        <th>Estado</th>
        <th style="text-align: right;">Operaciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');
  return { table, tbody };
};

// FUNCIÓN PARA CREAR UNA FILA INDIVIDUAL EN LA TABLA POR CADA TAREA
export const createTareaTableRow = (tarea) => {
  const tr = document.createElement('tr');
  tr.dataset.id = tarea._id;

  // Normalizamos las propiedades de la tarea para evitar valores indefinidos en la interfaz
  const descripcionTarea = tarea.descripcion || 'Sin descripción';
  const nombreActividad = tarea.actividad?.nombre || 'General';
  const esCompletada = !!tarea.completada;

  // Conmutamos los textos y estilos del tag visual según el estado de la tarea
  const tagTexto = esCompletada ? 'Hecho' : 'Pendiente';
  const tagClaseCss = esCompletada ? 'tag-estado estado-hecho' : 'tag-estado estado-pendiente';

  // Ajustamos dinámicamente el estilo, tooltip e icono del botón según el estado actual de la tarea
  const botonClaseCss = esCompletada ? 'secondary' : 'success';
  const botonTitulo = esCompletada ? 'Marcar como pendiente' : 'Marcar como completada';
  const botonIcono = esCompletada ? 'fa-xmark' : 'fa-check';

  // Construimos las celdas asignando las clases y los atributos de datos requeridos para los manejadores
  tr.innerHTML = `
    <td>${descripcionTarea}</td>
    <td>${nombreActividad}</td>
    <td>
      <mark class="${tagClaseCss}">${tagTexto}</mark>
    </td>
    <td style="text-align: right;">
      <div style="display: flex; justify-content: flex-end; gap: 0.25rem; align-items: center;">
        
        <button class="boton-completar outline ${botonClaseCss}" 
                data-id="${tarea._id}" 
                title="${botonTitulo}"
                style="margin: 0; padding: 0.25rem 0.5rem;">
          <i class="fa-solid ${botonIcono}"></i>
        </button>
        
        <button class="boton-eliminar outline contrast" 
                data-id="${tarea._id}"
                title="Eliminar tarea"
                style="margin: 0; padding: 0.25rem 0.5rem;">
          <i class="fa-solid fa-trash"></i>
        </button>

      </div>
    </td>
  `;
  return tr;
};

// FUNCIÓN PRINCIPAL PARA ACTUALIZAR EL CONTENEDOR VISUAL CON LA LISTA DE TAREAS
export const updateTareasContainer = (tareas, contenedor) => {
  // Vaciamos el contenedor antes de inyectar la nueva información
  contenedor.innerHTML = '';
  
  // Renderizamos un mensaje de aviso informativo si el listado de tareas está vacío
  if (tareas.length === 0 || !tareas) {
    contenedor.innerHTML = '<span style="display: inline-block; margin-left: 24px; margin-bottom: 16px;">No hay tareas registradas para este viaje.</span>';
    return;
  }
  
  // Instanciamos la tabla y añadimos cada fila de tarea procesada al cuerpo de la misma
  const { table, tbody } = createTareasTable();
  tareas.forEach(t => {
    tbody.appendChild(createTareaTableRow(t));
  });
  
  // Acoplamos la tabla completada dentro del contenedor del DOM correspondiente
  contenedor.appendChild(table);
};

// FUNCIÓN PARA RECOLECTAR LAS ENTRADAS DEL FORMULARIO DE ALTA DE TAREAS
export const getTareaDataFromForm = () => {
  const form = document.forms["tarea-create"];
  if (!form) return {};
  
  const formData = new FormData(form);
  
  // Estructuramos el objeto plano con los valores del formulario
  return {
    descripcion: formData.get("descripcion"),
    actividad: formData.get("actividad")
  };
};

// FUNCIÓN PARA RELLENAR DINÁMICAMENTE UN SELECT CON LAS ACTIVIDADES DISPONIBLES
export const populateActividadesSelect = (actividades, selectElement) => {
  if (!selectElement) return;
  
  // Limpiamos las opciones previas e inyectamos la opción por defecto deshabilitada
  selectElement.innerHTML = '<option value="" selected disabled>Asociar a actividad...</option>';

  // Recorremos las actividades generando y acoplando los elementos option al selector
  actividades.forEach(act => {
    const option = document.createElement('option');
    option.value = act._id;
    option.textContent = act.nombre;
    selectElement.appendChild(option);
  });
};