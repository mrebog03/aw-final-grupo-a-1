const mongoose = require('mongoose');

// Define la estructura de una tarea en la base de datos.
// Cada tarea pertenece a un viaje y a una actividad concreta.
const TareaSchema = new mongoose.Schema({
    // Referencia al viaje al que pertenece la tarea.
    viaje: { type: mongoose.Schema.Types.ObjectId, ref: "Viaje", required: true },
    // Referencia a la actividad asociada a la tarea.
    actividad: { type: mongoose.Schema.Types.ObjectId, ref: "Actividad", required: true },
    // Texto descriptivo de lo que hay que hacer.
    descripcion: { type: String, required: true },
    // Indica si la tarea ya se ha completado o no.
    completada: { type: Boolean, default: false }
});

// Crea y exporta el modelo para poder usarlo en controladores y rutas.
module.exports = mongoose.model("Tarea", TareaSchema);