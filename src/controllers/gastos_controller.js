// IMPORTAMOS LOS MÓDULOS
const Gasto = require("../models/gastos");
const gastosService = require("../services/gastos_service");

// FUNCIÓN PARA CREAR UN GASTO
const crearGasto = async (req, res) => {
  try {
    let { descripcion, cantidad, categoria, viaje } = req.body;

    // Si no viene en el body, lo buscamos en los params o query
    if (!viaje) viaje = req.params.viajeId || req.query.viajeId || req.params.id;
    if (!viaje) return res.status(400).json({ error: "Es obligatorio asignar el gasto a un viaje." });

    // Comprobamos que el usuario es miembro del viaje
    await gastosService.comprobarEsMiembro(viaje, req.user.id);

    // Creamos el gasto y lo vinculamos al viaje
    const nuevoGasto = await gastosService.crearGasto({ descripcion, cantidad, categoria, viajeId: viaje, userId: req.user.id });
    res.status(201).json(nuevoGasto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FUNCIÓN PARA OBTENER LOS GASTOS DE UN VIAJE
const obtenerGastosDeViaje = async (req, res) => {
  try {
    const { viaje } = req.params;

    // Comprobamos que el viaje existe y que el usuario es miembro
    await gastosService.comprobarExistenciaViaje(viaje);
    await gastosService.comprobarEsMiembro(viaje, req.user.id);

    // Devolvemos los gastos del viaje
    const gastos = await Gasto.find({ viaje }).populate("pagadoPor", "nombre email");
    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FUNCIÓN PARA OBTENER UN GASTO ESPECÍFICO
const obtenerGastoEspecifico = async (req, res) => {
  try {
    const { gastoId } = req.params;

    // Comprobamos que el gasto existe y que el usuario es miembro del viaje asociado
    const gastoExistente = await gastosService.comprobarExistenciaGasto(gastoId);
    await gastosService.comprobarEsMiembro(gastoExistente.viaje, req.user.id);

    // Comprobamos que el usuario es el pagador y devolvemos el gasto
    const gasto = await gastosService.comprobarPagador(gastoId, req.user.id);
    res.status(200).json(gasto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FUNCIÓN PARA ACTUALIZAR UN GASTO
const actualizarGasto = async (req, res) => {
  try {
    const { descripcion, cantidad, categoria } = req.body;
    const { gastoId } = req.params;

    // Solo el pagador puede actualizar el gasto
    const gasto = await gastosService.comprobarPagador(gastoId, req.user.id);

    // Actualizamos solo los campos que lleguen en el body
    if (descripcion) gasto.descripcion = descripcion;
    if (cantidad) gasto.cantidad = cantidad;
    if (categoria) gasto.categoria = categoria;

    await gasto.save();
    res.status(200).json({ mensaje: "Gasto actualizado correctamente", gasto });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

// FUNCIÓN PARA ELIMINAR UN GASTO
const eliminarGasto = async (req, res) => {
  try {
    const { gastoId } = req.params;

    // Solo el pagador puede eliminar el gasto
    const gasto = await gastosService.comprobarPagador(gastoId, req.user.id);

    // Eliminamos el gasto y lo desvinculamos del viaje
    await gastosService.eliminarGasto(gasto);
    res.status(200).json({ mensaje: "Gasto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FUNCIÓN PARA OBTENER GASTOS CON FILTROS
const obtenerGastosGeneral = async (req, res) => {
  try {
    // Delegamos la lógica de filtrado al service
    const gastos = await gastosService.obtenerGastosFiltrados(req.query, req.user.id);
    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// EXPORTAMOS LAS FUNCIONES
module.exports = {
  crearGasto,
  obtenerGastosDeViaje,
  obtenerGastosGeneral,
  obtenerGastoEspecifico,
  actualizarGasto,
  eliminarGasto,
};