const mongoose = require("mongoose");

const AlojamientosSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true},
    ciudad: { type: String, required: true},
    direccion: { type: String, required: true},
    capacidad: { type: Number, required: true },
    extras: { type: [String] },
    precioNoche: { type: Number, required: true },
    imagenes: {type: [String], required: true}
});

module.exports = mongoose.model("Alojamientos", AlojamientosSchema);