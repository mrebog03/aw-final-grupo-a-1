//IMPORTAR MODELOS
const Alojamiento = require("../models/alojamientos");

//FUNCION PARA CREAR UN ALOJAMIENTO
const crearAlojamiento = async(data) => {
  const nuevoAlojamiento = new Alojamiento(data);
  return await nuevoAlojamiento.save();
}

//FUNCION PARA ELIMINAR UN ALOJAMIENTO
const eliminarAlojamiento = async(id) => {
  return await Alojamiento.findByIdAndDelete(id);
}

//FUNCION PARA MODIFICAR UN ALOJAMIENTO
const actualizarAlojamiento = async(id, data) => {
  return await Alojamiento.findByIdAndUpdate(id, data, {new: true});
}

//FUNCION PARA BUSCAR UN ALOJAMIENTO APLICANDO FILTROS
const obtenerTodos = async(query) => {
  const {nombre, ciudad, capacidad, extras} = query;
  const filtro = {};

  //Busca por nombre/ciudad sin importar mayusculas o minusculas
  if (nombre && nombre.trim() !== "") {
    filtro.nombre = { $regex: nombre.trim(), $options: "i" };
  }

  if (ciudad && ciudad.trim() !== ""){
    filtro.ciudad = { $regex: ciudad.trim(), $options: "i" };
  }

  //Convierte a numero y busca capacidades mayores o iguales a la pedida
  if (capacidad){
    filtro.capacidad = { $gte: parseInt(capacidad) };
  }

  //Separa los extras por comas y busca el que tenga lo pedido
  if (extras){
    const extrasArray = extras.split(",");
    filtro.extras = { $all: extrasArray };
  }

  return await Alojamiento.find(filtro);
}

module.exports = {
  crearAlojamiento,
  eliminarAlojamiento,
  actualizarAlojamiento,
  obtenerTodos,
};