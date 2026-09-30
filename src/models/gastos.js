const mongoose = require("mongoose");

const GastoSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    viaje: { type: mongoose.Schema.Types.ObjectId, ref: "Viaje", required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: Number, required: true },
    categoria: {
        type: String,
        enum: ["Transporte", "Alojamiento", "Comida", "Actividad", "Otros"],
        default: "Otros"
    },
    pagadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Gasto", GastoSchema);