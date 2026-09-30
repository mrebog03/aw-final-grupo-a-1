//IMPORTAMOS EL SERVICIO
const alojamientoService = require("../services/alojamientos_service");


/////////////////////////////////////////// TAREAS ADMIN ///////////////////////////////////////////
//FUNCION PARA CREAR UN NUEVO ALOJAMIENTO
const createAlojamiento = async(req, res) => {
  try {
    //Obtenemos la informacion necesario para crear un alojamiento
    const {nombre, descripcion, ciudad, direccion, capacidad, extras, precioNoche, imagenes} = req.body
    const alojamiento = {nombre, descripcion, ciudad, direccion, capacidad, extras, precioNoche, imagenes};

    //Creamos un nuevo alojamiento
    const nuevoAlojamiento = await alojamientoService.crearAlojamiento(alojamiento);

    //Devolvemos una respuesta de exito si todo ha ido bien
    res.status(201).json({message: `Alojamiento ${nuevoAlojamiento.nombre} creado con exito`});

  } catch(error){
    console.error(error.message);
    res.status(500).json({message: error.message});
  }
};

//FUNCION PARA ELIMINAR UN ALOJAMIENTO
const deleteAlojamiento = async(req, res) => {
  try {
    //Obtenemos el id del alojamiento para eliminarlo
    const {alojamientoID} = req.params;

    //Buscamos el id en la base de datos y lo eliminamos
    const alojamientoEliminado = await alojamientoService.eliminarAlojamiento(alojamientoID);
    if (!alojamientoEliminado){
      return res.status(404).json({message: "Alojamiento no encontrado"});
    }

    //Devolvemos una respuesta de existo si todo ha ido bien
    res.status(200).json({message: `Alojamiento ${alojamientoEliminado.nombre} eliminado con exito`});

  } catch (error){
    console.error(error.message);
    res.status(500).json({message: error.message});
  }
};

//FUNCION PARA MODIFICAR UN ALOJAMIENTO
const updateAlojamiento = async(req, res) => {
  try {
    //Extraemos los datos necesarios para actulizar un alojamiento
    const {alojamientoID} = req.params;
    const {nombre, descripcion, ciudad, direccion, capacidad, extras, precioNoche, imagenes} = req.body
    const alojamiento = {nombre, descripcion, ciudad, direccion, capacidad, extras, precioNoche, imagenes};

    //Buscamos el alojamiento y actualizamos su informacion
    const alojamientoActualizado = await alojamientoService.actualizarAlojamiento(alojamientoID, alojamiento);
    if (!alojamientoActualizado){
      return res.status(404).json({message: "Alojamiento no encontrado"});
    }

    //Devolvemos una respuesta de exito si todo ha ido bien
    res.status(200).json({message: `Alojamiento ${alojamientoActualizado.nombre} actualizado con exito`});
  } catch (error){
    console.error(error.message);
    res.status(500).json({message: error.message});
  }
};

/////////////////////////////////////////// TAREAS CLIENTE ///////////////////////////////////////////

//FUNCION PARA VER LOS ALOJAMIENTOS DISPONIBLES
const getAlojamientos = async(req, res) => {
  try {
    //Extraemos la informacion que utilizaremos como filtros de busqueda
    const {nombre, ciudad, capacidad, extras} = req.query;
    const filtrosBusqueda = {nombre, ciudad, capacidad, extras};
      
    //Obtenemos todos los alojamientos disponibles de la base de datos
    const alojamientos = await alojamientoService.obtenerTodos(filtrosBusqueda);

    //Devolemos la lista de alojamientos al clientes
    res.status(200).json(alojamientos);

  } catch (error){
    console.error(error.message);
    res.status(500).json({message:error.message});
  }
};

//EXPORTAMOS LAS FUNCIONES
module.exports = {
  createAlojamiento,
  deleteAlojamiento,
  updateAlojamiento,
  getAlojamientos,
};
