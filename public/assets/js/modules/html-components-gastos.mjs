// Módulo para crear componentes HTML relacionados con gastos
// Función para crear notificaciones personalizadas
const createNotification = (msg) => {
  const span = document.createElement('span');
  span.innerText = msg;
  span.className = 'notificacion-gastos';
  return span; 
};

// Función para crear la tabla de gastos
const createGastosTable = () => {
  const table = document.createElement('table'); // Crear tabla
  table.className = 'gastos-table';

  const thead = document.createElement('thead'); // Crear encabezado de la tabla
  table.appendChild(thead);
  const headerRow = document.createElement('tr'); // Crear fila para el encabezado
  thead.appendChild(headerRow);

  const columnas = ['Descripcion', 'Pagado por', 'Cantidad', 'Categoria', 'Operaciones'];
  columnas.forEach(column => { // Crear cada celda del encabezado
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.appendChild(th);
  });

  const tbody = document.createElement('tbody'); // Crear cuerpo de la tabla
  table.appendChild(tbody);
  return {table, tbody};
}

// Función para crear una fila de la tabla de gastos a partir de un gasto
const createGastoTableRow = (gasto) => {
  const tr = document.createElement('tr'); // Crear fila para el gasto
  tr.dataset.gastoId = gasto._id;

  const descripcion = document.createElement('td'); // Celda para la descripción del gasto
  descripcion.textContent = gasto.descripcion;
  tr.appendChild(descripcion);

  const pagadoPor = document.createElement('td'); // Celda para el nombre de la persona que pagó el gasto
  pagadoPor.textContent = gasto.pagadoPor?.nombre || gasto.pagadoPor || 'Desconocido';
  tr.appendChild(pagadoPor);

  const cantidad = document.createElement('td'); // Celda para la cantidad del gasto
  cantidad.textContent = gasto.cantidad + ' €';
  tr.appendChild(cantidad);

  const categoria = document.createElement('td'); // Celda para la categoría del gasto
  categoria.textContent = gasto.categoria;
  tr.appendChild(categoria);

  const operaciones = document.createElement('td'); // Celda para los botones de editar y eliminar
  operaciones.className = 'actions-cell';
  const botonEditar = document.createElement('button'); // Botón para editar el gasto
  botonEditar.innerHTML = '<i class="fa-solid fa-pen"></i> Editar';
  botonEditar.dataset.id = gasto._id;
  botonEditar.className = 'boton-editar';

  const botonEliminar = document.createElement('button'); // Botón para eliminar el gasto
  botonEliminar.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';
  botonEliminar.dataset.id = gasto._id;
  botonEliminar.className = 'boton-eliminar';

  operaciones.appendChild(botonEditar);
  operaciones.appendChild(botonEliminar);

  tr.appendChild(operaciones);
  return tr;
}

// Función para obtener los datos del gasto desde el formulario
const getGastoDataFromForm = () => {
  const form = document.forms["gasto-create"];
  if (!form) return null;
  
  // Crear un objeto FormData para extraer los datos del formulario
  const formData = new FormData(form);
  // Devolver un objeto con los datos del gasto
  return {
    descripcion: formData.get("descripcion"),
    cantidad: parseFloat(formData.get("cantidad")),
    viaje: formData.get("viajeId"),
    pagadoPor: formData.get("pagadoPor"),
    categoria: formData.get("categoria"),
    fecha: new Date().toISOString()
  };
}

// Función para resetear el formulario de creación de gasto
const resetGastoForm = () => {
  const form = document.forms["gasto-create"];
  if (form) form.reset();
}

// Función para actualizar el contenedor de gastos con una nueva lista de gastos
const updateGastosContainer = (gastos, contenedor) => {
  contenedor.innerHTML = ''; // Limpiar el contenedor antes de agregar los nuevos gastos
  if (gastos.length === 0) { // Si no hay gastos, mostrar una notificación
    const notificacion = createNotification("No hay gastos para mostrar");
    contenedor.appendChild(notificacion);
  } else { 
    const {table, tbody} = createGastosTable();
    gastos.forEach (gasto => { // Crear una fila para cada gasto y agregarla al cuerpo de la tabla
      const row = createGastoTableRow(gasto);
      tbody.appendChild(row);
    });
    contenedor.appendChild(table);
  } 
}

// Exportar las funciones para que puedan ser utilizadas en otros módulos
export {createNotification, createGastosTable, createGastoTableRow, updateGastosContainer, resetGastoForm, getGastoDataFromForm};