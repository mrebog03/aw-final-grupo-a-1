const mongoose = require("mongoose");

const ReservaAlojamientoSchema = new mongoose.Schema({
  alojamiento: {type: mongoose.Schema.Types.ObjectId, ref: "Alojamientos", required: true},
  viaje: {type: mongoose.Schema.Types.ObjectId, ref: "Viaje", required: true},
  usuarioReserva: {type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true},
  fechaEntrada: {type: Date, required: true},
  fechaSalida: {type: Date, required: true},
  huespedes: {type: Number, required: true},
  precioTotal: {type: Number, required: true},
  estado: {type: String, enum: ["pendiente", "confirmada", "cancelada"], default: "pendiente"}
});

module.exports = mongoose.model("ReservaAlojamiento", ReservaAlojamientoSchema);