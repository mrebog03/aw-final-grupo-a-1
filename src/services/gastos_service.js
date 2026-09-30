const Viaje = require("../models/viaje");
const Gasto = require("../models/gastos");

// Comprueba la existencia de un viaje
const comprobarExistenciaViaje = async (viajeId) => {
  const viajeExistente = await Viaje.findById(viajeId);
  if (!viajeExistente) throw new Error("El viaje no existe");
  return viajeExistente;
};

// Comprueba que el usuario es miembro del viaje
const comprobarEsMiembro = async (viajeId, usuarioId) => {
  const viaje = await comprobarExistenciaViaje(viajeId);
  const esMiembro = viaje.usuariosApuntados.some((u) => u.toString() === usuarioId.toString());
  if (!esMiembro) throw new Error("No eres miembro del viaje");
  return viaje;
};

// Comprueba que el gasto existe
const comprobarExistenciaGasto = async (gastoId) => {
  const gastoExistente = await Gasto.findById(gastoId);
  if (!gastoExistente) throw new Error("El gasto no existe");
  return gastoExistente;
};

// Comprueba que el usuario es el pagador del gasto
const comprobarPagador = async (gastoId, usuarioId) => {
  const gasto = await comprobarExistenciaGasto(gastoId);
  if (gasto.pagadoPor.toString() !== usuarioId.toString()) throw new Error("No eres el pagador");
  return gasto;
};

// Crea un gasto y lo vincula al viaje
const crearGasto = async ({ descripcion, cantidad, categoria, viajeId, userId }) => {
  const nuevoGasto = new Gasto({ viaje: viajeId, descripcion, cantidad, categoria, pagadoPor: userId });
  await nuevoGasto.save();
  await Viaje.findByIdAndUpdate(viajeId, { $push: { gastosHechos: nuevoGasto._id } });
  return nuevoGasto;
};

// Elimina un gasto y lo desvincula del viaje
const eliminarGasto = async (gasto) => {
  const viajeId = gasto.viaje;
  await gasto.deleteOne();
  await Viaje.findByIdAndUpdate(viajeId, { $pull: { gastosHechos: gasto._id } });
};

// Obtiene gastos aplicando filtros opcionales de categoria y viaje
const obtenerGastosFiltrados = async ({ categoria, viaje }, usuarioId ) => {
  const filtro = {};
  if (categoria && categoria !== "undefined") filtro.categoria = categoria;
  if (viaje && viaje !== "undefined") {
    await comprobarEsMiembro(viaje, usuarioId);
    filtro.viaje = viaje;
  } else {
    const viajesUsuario = await Viaje.find({ usuariosApuntados: usuarioId }).select("_id");
    filtro.viaje = { $in: viajesUsuario.map(v => v._id) };
  }
  return await Gasto.find(filtro)
    .populate("pagadoPor", "nombre email")
    .populate("viaje", "nombre");
};

module.exports = {
  comprobarExistenciaViaje,
  comprobarEsMiembro,
  comprobarExistenciaGasto,
  comprobarPagador,
  crearGasto,
  eliminarGasto,
  obtenerGastosFiltrados,
};