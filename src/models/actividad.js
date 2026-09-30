const mongoose = require("mongoose");

const ActividadSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    nombre: { type: String, required: true },
    descripcion: { type: String },
    fecha: { type: Date, required: true },
    lugar: { type: String, required: true },
    precio: { type: Number, required: true },
    capacidad: { type: Number, required: true },
    idViaje: { type: mongoose.Schema.Types.ObjectId, ref: "Viaje" }
    //imagenes: { type: [String], required: true }
});

module.exports = mongoose.model("Actividad", ActividadSchema);