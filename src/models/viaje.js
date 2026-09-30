const mongoose = require("mongoose");

const ViajeSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    titulo: { type: String, required: true },
    descripcion: { type: String },
    fecha_inicio: { type: Date, required: true },
    fecha_fin: { type: Date, required: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true},
    usuariosApuntados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Usuario" }],
    gastosHechos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gasto"}],
    actividadesReservadas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Actividad"}],
    codigo: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Viaje", ViajeSchema);