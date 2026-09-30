/**
 * Crea una tarjeta individual para un viaje utilizando componentes de PicoCSS
 */
export const createViajeCard = (viaje) => {
  const article = document.createElement('article');
  article.className = 'card viaje-card';

  const inicio = viaje.fecha_inicio ? new Date(viaje.fecha_inicio).toLocaleDateString() : 'Sin fecha';
  const fin = viaje.fecha_fin ? new Date(viaje.fecha_fin).toLocaleDateString() : 'Sin fecha';

  article.innerHTML = `
    <header>
      <h3 style="margin: 0; font-size: 1.35rem;">${viaje.titulo}</h3>
    </header>
    
    <div class="viaje-info">
      <p><strong><i class="fa-solid fa-calendar-days"></i> Duración:</strong> ${inicio} - ${fin}</p>
      <p><strong><i class="fa-solid fa-key"></i> Código de grupo:</strong> <mark style="font-family: monospace; font-size: 1.1rem; padding: 2px 6px;">${viaje.codigo || 'N/A'}</mark></p>
    </div>

    <footer>
      <div class="grid-botones-viaje">
        <a href="actividades.html?viajeId=${viaje._id}" class="button contrast outline">
          <i class="fa-solid fa-person-hiking"></i> Actividades
        </a>
        <a href="tareas.html?viajeId=${viaje._id}" class="button contrast outline">
          <i class="fa-solid fa-list-check"></i> Tareas
        </a>
        <a href="gastos.html?viajeId=${viaje._id}" class="button contrast outline">
          <i class="fa-solid fa-coins"></i> Gastos
        </a>
        <button class="boton-eliminar-viaje secondary outline" data-id="${viaje._id}" title="Eliminar viaje">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </footer>
  `;

  return article;
};

/**
 * Actualiza el contenedor principal con la lista de tarjetas de viajes
 */
export const updateViajesContainer = (viajes, contenedor) => {
  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (!viajes || viajes.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align:center; padding: 3rem; border: 2px dashed #ccc; border-radius: 8px;">
        <i class="fa-solid fa-plane-slash" style="font-size: 3rem; color: #718096; margin-bottom: 1rem;"></i>
        <p>Aún no tienes ningún viaje planificado.</p>
      </div>
    `;
    return;
  }

  // Creamos un contenedor grid dinámico de PicoCSS
  const gridContainer = document.createElement('div');
  gridContainer.className = 'viajes-grid-dinamico';

  viajes.forEach(viaje => {
    const card = createViajeCard(viaje);
    gridContainer.appendChild(card);
  });

  contenedor.appendChild(gridContainer);
};

/**
 * Rellena el selector de viajes con los datos traídos de MongoDB
 */
export const populateViajesSelect = (viajes, selectElement, viajeIdActual = null) => {
  if (!selectElement) return;
  
  selectElement.innerHTML = '<option value="" selected disabled>Selecciona un viaje...</option>';

  // Si entramos desde un viaje concreto (?viajeId=...), filtramos el array 
  // para que SOLO aparezca ese viaje en el desplegable
  const viajesAFiltrar = viajeIdActual 
    ? viajes.filter(v => v._id === viajeIdActual) 
    : viajes;

  viajesAFiltrar.forEach(viaje => {
    const option = document.createElement('option');
    option.value = viaje._id;
    option.textContent = viaje.titulo;
    
    // Lo dejamos seleccionado por defecto
    if (viajeIdActual && viaje._id === viajeIdActual) {
      option.selected = true;
    }

    selectElement.appendChild(option);
  });

  // OPCIONAL: Si quieres que además el usuario no pueda desplegarlo ni cambiarlo 
  // porque ya viene fijado desde el viaje, puedes deshabilitarlo:
  if (viajeIdActual) {
    selectElement.disabled = true; 
    // De esta forma se queda fijo con el viaje correcto y no pueden alterarlo
  } else {
    selectElement.disabled = false;
  }
};