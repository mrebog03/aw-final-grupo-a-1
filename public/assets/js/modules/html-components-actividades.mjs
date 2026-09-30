// FUNCIÓN PARA CREAR LA ESTRUCTURA BASE DE LA TABLA DE ACTIVIDADES
export const createActividadesTable = () => {
  const table = document.createElement('table');
  table.className = 'striped'; // Clase de PicoCSS para filas alternas

  // Definimos las cabeceras estructurando los atributos de ordenación interactivos
  table.innerHTML = `
    <thead>
      <tr>
        <th class="columna-ordenar" data-orden="nombre" style="cursor: pointer; user-select: none;">Actividad <span class="flecha-orden">▽</span></th>
        <th>Ubicación</th>
        <th class="columna-ordenar" data-orden="fecha" style="cursor: pointer; user-select: none;">Fecha <span class="flecha-orden">▽</span></th>
        <th class="columna-ordenar" data-orden="precio" style="cursor: pointer; user-select: none;">Precio <span class="flecha-orden">▽</span></th>
        <th class="columna-ordenar" data-orden="capacidad" style="cursor: pointer; user-select: none;">Cupos <span class="flecha-orden">▽</span></th>
        <th style="text-align: right;">Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  
  return table;
};

// FUNCIÓN PARA CREAR UNA FILA INDIVIDUAL EN LA TABLA POR CADA ACTIVIDAD
export const createActividadRow = (actividad) => {
  const tr = document.createElement('tr');
  
  // Normalizamos las propiedades de la actividad para evitar valores indefinidos en la vista
  const nombreActividad = actividad.nombre || 'Sin nombre';
  const descripcionActividad = actividad.descripcion || '';
  const lugarActividad = actividad.lugar || 'No especificado';
  const precioActividad = actividad.precio ?? 0;
  const capacidadActividad = actividad.capacidad ?? 0;
  const fechaFormateada = actividad.fecha ? new Date(actividad.fecha).toLocaleDateString() : 'Sin fecha';

  // Evaluamos el estado previo de reserva del usuario para conmutar las clases y textos del botón
  const estaReservada = !!actividad.yaReservada;
  const claseBotonCliente = estaReservada ? 'boton-cancelar secondary btn-cancelar-custom' : 'boton-reservar';
  const textoBotonCliente = estaReservada ? 'Cancelar Reserva' : 'Apuntarse';
  const iconoBotonCliente = estaReservada ? 'fa-user-minus' : 'fa-user-plus';
  const atributosExtraCliente = estaReservada ? `data-reserva-id="${actividad.reservaId}"` : '';

  // Construimos las celdas asignando las clases y atributos requeridos para la gestión de permisos
  tr.innerHTML = `
    <td>
      <div class="actividad-info">
        <strong>${nombreActividad}</strong><br>
        <small>${descripcionActividad}</small>
      </div>
    </td>
    <td><i class="fa-solid fa-location-dot"></i> ${lugarActividad}</td>
    <td>${fechaFormateada}</td>
    <td>${precioActividad} €</td>
    <td><i class="fa-solid fa-users"></i> ${capacidadActividad}</td>
    <td style="text-align: right;">
      <div style="display: flex; justify-content: flex-end; gap: 0.25rem; align-items: center;">
        
        <button class="boton-editar outline contrast" data-id="${actividad._id}" data-admin-only title="Editar actividad" style="margin: 0; padding: 0.25rem 0.5rem;">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button class="boton-eliminar outline contrast" data-id="${actividad._id}" data-admin-only title="Eliminar actividad" style="margin: 0; padding: 0.25rem 0.5rem;">
          <i class="fa-solid fa-trash"></i>
        </button>

        <button class="${claseBotonCliente}" data-id="${actividad._id}" ${atributosExtraCliente} data-client-only style="margin: 0; padding: 0.25rem 0.75rem; font-size: 0.85rem;">
          <i class="fa-solid ${iconoBotonCliente}"></i> ${textoBotonCliente}
        </button>

      </div>
    </td>
  `;
  
  return tr;
};

// FUNCIÓN PRINCIPAL PARA ACTUALIZAR EL CONTENEDOR VISUAL CON LA LISTA DE ACTIVIDADES
export const updateActividadesContainer = (actividades, contenedor) => {
  if (!contenedor) return;
  
  // Vaciamos el contenedor antes de inyectar la nueva información
  contenedor.innerHTML = '';

  // Renderizamos un mensaje de aviso maquetado si el listado se encuentra vacío
  if (!actividades || actividades.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align:center; padding: 2rem; border: 2px dashed #ccc; border-radius: 8px;">
        <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; color: #718096; margin-bottom: 1rem;"></i>
        <p>No hay actividades registradas en este momento.</p>
      </div>
    `;
    return;
  }

  // Instanciamos la tabla y añadimos cada fila de actividad procesada al cuerpo de la misma
  const table = createActividadesTable();
  const tbody = table.querySelector('tbody');

  actividades.forEach(act => {
    const row = createActividadRow(act);
    tbody.appendChild(row);
  });

  // Acoplamos la tabla completada dentro del contenedor del DOM correspondiente
  contenedor.appendChild(table);
};

// FUNCIÓN PARA RECOLECTAR Y LIMPIAR LAS ENTRADAS DEL FORMULARIO DE ALTA DE ACTIVIDADES
export const getActividadDataFromForm = () => {
  const form = document.forms["actividad-create"];
  if (!form) return null;

  const formData = new FormData(form);
  
  // Estructuramos y transformamos los tipos de datos requeridos por la base de datos
  return {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    fecha: formData.get("fecha"),
    lugar: formData.get("lugar"),
    precio: parseFloat(formData.get("precio")) || 0,
    capacidad: parseInt(formData.get("capacidad")) || 0
  };
};