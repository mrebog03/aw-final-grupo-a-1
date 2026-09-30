const mongoose = require("mongoose");

const ReservaActividadSchema = new mongoose.Schema({
  actividad: {type: mongoose.Schema.Types.ObjectId, ref: "Actividad", required: true},
  viaje: {type: mongoose.Schema.Types.ObjectId, ref: "Viaje", required: true},
  usuarioReserva: {type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true},
  fechaReserva: {type: Date, required: true},
  participantes: {type: Number, required: true},
  precioTotal: {type: Number, required: true},
  estado: {type: String, enum: ["confirmado", "pendiente", "cancelado"], default: "pendiente"}
});

module.exports = mongoose.model("ReservaActividad", ReservaActividadSchema);