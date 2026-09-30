// Archivo principal del servidor Express
//require("dotenv").config();
// Modulos necesarios
const path = require("path");
const express = require("express");
const database = require("./models/db");
const cookieParser = require("cookie-parser");
// Rutas
const viajeRouter = require("./routes/viajes");
const gastosRouter = require("./routes/gastos");
const actividadRouter = require("./routes/actividades");
const alojamientosRouter = require("./routes/alojamientos")
const userRouter = require("./routes/user");
const tareasRouter = require("./routes/tareas");
const reservaActividadesRouter = require("./routes/reservaActividades");
const reservaAlojamientosRouter = require("./routes/reservas_alojamientos");
// Función para iniciar el servidor web
const startWebServer = async () => {
    try {
        await database.conectarDB();
        const app = express();
        const port = process.env.WEBAPP_PORT || 5500;
        // Middleware
        app.use(express.json());
        app.use(cookieParser());
        // Rutas API
        app.use("/api/viajes", viajeRouter);
        app.use("/api/gastos", gastosRouter);
        app.use("/api/actividades", actividadRouter);
        app.use("/api/user", userRouter);
        app.use("/api/alojamientos", alojamientosRouter);
        app.use("/api/tareas", tareasRouter);
        app.use("/api/reservas/actividades", reservaActividadesRouter);
        app.use("/api/reservas/alojamiento", reservaAlojamientosRouter);
        app.use(express.static(path.join(__dirname, "../public")));
        app.get("/", (req, res) => res.redirect("/login.html"));
        
        app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));
    } catch (e){
        console.log(e);
    }
};

console.log("Iniciando el servidor web");
startWebServer();