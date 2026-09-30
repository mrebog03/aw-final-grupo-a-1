const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { 
        type: String,
        required: true,
        enum: ["Cliente", "Admin"],
        default: "Cliente"
    }
});

module.exports = mongoose.model("Usuario", UsuarioSchema);