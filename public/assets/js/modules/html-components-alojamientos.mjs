const createNotification = (msg) => {
  const span = document.createElement('span');
  span.innerText = msg;
  return span;
};

//ESTRUCTURA TABLA
const createAlojamientosTable = () => {
  const table = document.createElement('table');
  table.className = 'alojamientos-table';
  table.setAttribute('role', 'grid');

  const thead = document.createElement('thead');
  table.appendChild(thead);
  const headerRow = document.createElement('tr');
  thead.appendChild(headerRow);

  //Cabecera
  const columnas = ['Imagen', 'Nombre', 'Descripcion', 'Ciudad', 'Capacidad', 'Extras', 'Precio', 'Acciones'];
  columnas.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.appendChild(th);
  });

  //Cuerpo
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  return {table, tbody};
}

//CREA FILAS DE DATOS
const createAlojamientoTableRow = (alojamiento) => {
  const tr = document.createElement('tr');
  tr.dataset.alojamientoId = alojamiento._id;

  const imagenTd = document.createElement('td');
  const img = document.createElement('img');
  const urlImagen = Array.isArray(alojamiento.imagenes) ? alojamiento.imagenes[0] : alojamiento.imagenes;
  img.src = urlImagen || 'https://via.placeholder.com/100?text=Sin+Foto';
  
  imagenTd.appendChild(img);
  tr.appendChild(imagenTd);

  const nombre = document.createElement('td');
  nombre.textContent = alojamiento.nombre;
  tr.appendChild(nombre);

  const descripcion = document.createElement('td');
  descripcion.textContent = alojamiento.descripcion || '-';
  tr.appendChild(descripcion);

  const ciudad = document.createElement('td');
  ciudad.textContent = alojamiento.ciudad;
  tr.appendChild(ciudad);

  const capacidad = document.createElement('td');
  capacidad.textContent = alojamiento.capacidad;
  tr.appendChild(capacidad);

  const extras = document.createElement('td');
  //Unir los extras si vienen en forma de array
  extras.textContent = Array.isArray(alojamiento.extras) ? alojamiento.extras.join(', ') : (alojamiento.extras || '-');
  tr.appendChild(extras);

  const precio = document.createElement('td');
  // Le añadimos el símbolo del euro para que quede más profesional
  precio.textContent = alojamiento.precioNoche ? alojamiento.precioNoche + ' €' : '-';
  tr.appendChild(precio);

  const operaciones = document.createElement('td');
  operaciones.className = 'celda-acciones';

  //Extraemos el tipo de usuario
  const usuarioLogueado = localStorage.getItem('rol');
  const esAdmin = usuarioLogueado && usuarioLogueado.trim().toLowerCase() === 'admin';

  //Si es cliente
  if(!esAdmin){
    //Boton reservar
    const contenedorReservar = document.createElement('div');
    contenedorReservar.className = 'contenedor-reservar';

    const botonReservar = document.createElement('button');
    botonReservar.textContent = 'Reservar';
    botonReservar.dataset.id = alojamiento._id;
    botonReservar.className = 'boton-reservar';

    botonReservar.dataset.precio = alojamiento.precioNoche;
    botonReservar.dataset.capacidad = alojamiento.capacidad;

    contenedorReservar.appendChild(botonReservar);
    operaciones.appendChild(contenedorReservar);
  }

  //Si es admin
  if(esAdmin){
    //Botones editar y elimiar
    const contenedorAdmin = document.createElement('div');
    contenedorAdmin.className = 'contenedor-admin';

    const botonEditar = document.createElement('button');
    botonEditar.textContent = 'Editar';
    botonEditar.dataset.id = alojamiento._id;
    botonEditar.className = 'boton-editar';

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.dataset.id = alojamiento._id;
    botonEliminar.className = 'boton-eliminar';

    contenedorAdmin.appendChild(botonEditar);
    contenedorAdmin.appendChild(botonEliminar)

    operaciones.appendChild(contenedorAdmin);
  }

  tr.appendChild(operaciones);
  return tr;
}

//EXTRAE LOS DATOS DEL FORMULARIO
const getAlojamientoDataFromForm = () => {
  const form = document.forms["alojamiento-create"];
  if (!form){
    return null;
  }
  
  const formData = new FormData(form);
  
  const extrasArray = formData.getAll("extras");

  const imagenString = formData.get("imagenes");
  const imagenesArray = imagenString ? [imagenString] : [];

  return {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    ciudad: formData.get("ciudad"),
    direccion: formData.get("direccion"),
    precioNoche: parseFloat(formData.get("precioNoche")),
    capacidad: parseInt(formData.get("capacidad")),
    extras: extrasArray,
    imagenes: imagenesArray
  };
}

//VACIA EL FORMULARIO
const resetAlojamientoForm = () => {
  const form = document.forms["alojamiento-create"];
  if (form) form.reset();
}

//ACTULIZA EL CONTENEDOR CADA VEZ QUE SE HACE ALGO
const updateAlojamientosContainer = (alojamientos, contenedor) => {
  contenedor.innerHTML = '';
  
  if (alojamientos.length === 0) {
    const notificacion = createNotification("No hay alojamientos que coincidan con la busqueda.");
    contenedor.appendChild(notificacion);
  } else {
    const {table, tbody} = createAlojamientosTable();
    alojamientos.forEach(alojamiento => {
      const row = createAlojamientoTableRow(alojamiento);
      tbody.appendChild(row);
    });
    contenedor.appendChild(table);
  } 
}

//EXPORTS
export {
  createNotification,
  createAlojamientosTable,
  createAlojamientoTableRow,
  updateAlojamientosContainer,
  resetAlojamientoForm,
  getAlojamientoDataFromForm
}