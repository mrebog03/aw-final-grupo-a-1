const mongoose = require("mongoose");
const Actividad = require("../models/actividad");
const Viaje = require("../models/viaje");
const ReservaActividad = require("../models/reserva_actividad");

// FUNCIÓN PARA CREAR UNA NUEVA ACTIVIDAD Y VINCULARLA A UN VIAJE (SI SE PROPORCIONA)
const crearActividad = async (req, res) => {
    try {
        // Obtenemos la información necesaria para crear una actividad desde el cuerpo de la petición
        const { nombre, descripcion, fecha, lugar, precio, capacidad, viaje} = req.body;
        const nuevaActividad = new Actividad({ nombre, descripcion, fecha, lugar, precio, capacidad, idViaje: viaje });
        
        // Guardamos la nueva actividad en la base de datos
        await nuevaActividad.save();

        // Si se incluye un ID de viaje, vinculamos de forma automática la actividad al viaje correspondiente
        if (viaje) {            
            await Viaje.findByIdAndUpdate(
                viaje,
                { $push: { actividadesReservadas: nuevaActividad._id } }
            );
        }

        // Devolvemos una respuesta de éxito con la actividad creada si todo ha ido bien
        res.status(201).json({mensaje: "Actividad creada correctamente", actividad: nuevaActividad});

    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear la actividad", error: error.message});
    }
};

// FUNCIÓN PARA EDITAR UNA ACTIVIDAD EXISTENTE POR SU ID
const editarActividad = async (req, res) => {
    try {
        // Obtenemos el identificador de la actividad desde los parámetros de la ruta
        const { id } = req.params;
        
        // Actualizamos los datos de la actividad en la base de datos aplicando las validaciones del modelo
        const actividadActualizada = await Actividad.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        // Validamos si la actividad realmente existía en el sistema
        if (!actividadActualizada) { 
            return res.status(404).json({ mensaje: "Actividad no encontrada" });
        }

        // Devolvemos una respuesta de éxito con el documento actualizado si todo ha ido bien
        return res.status(200).json({ 
            mensaje: "Actividad actualizada correctamente", 
            actividad: actividadActualizada 
        });

    } catch (error) {
        return res.status(500).json({ 
            mensaje: "Error al editar la actividad", 
            error: error.message 
        });
    }
};

// FUNCIÓN PARA ELIMINAR UNA ACTIVIDAD POR SU ID
const eliminarActividad = async (req, res) => {
    try {
        // Buscamos la actividad por ID y validamos si existe en el sistema
        const actividad  = await Actividad.findById(req.params.id);
        if (!actividad) return res.status(404).json({ mensaje: "Actividad no encontrada"});

        // Eliminamos la referencia de esta actividad en todos los viajes que la tengan vinculada
        await Viaje.updateMany(
            { actividadesReservadas: actividad._id },
            { $pull: { actividadesReservadas: actividad._id}}
        );

        // Eliminamos definitivamente el registro de la actividad de la base de datos
        await actividad.deleteOne();
        
        // Devolvemos una respuesta de éxito si todo ha ido bien
        res.status(200).json({ mensaje: "Actividad eliminada correctamente"});
        
    } catch (error){
        res.status(500).json({ mensaje: "Error al eliminar la actividad", error: error.message});
    }
};

// FUNCIÓN PARA OBTENER TODAS LAS ACTIVIDADES, CON FILTRO OPCIONAL POR VIAJE Y ORDENACIÓN
const obtenerActividades = async (req, res) => {
    try {
        // Obtenemos los parámetros de filtrado y ordenación desde la consulta de la URL
        const { viaje, sort, direction } = req.query;
        const filtro = {};

        if (viaje && viaje !== 'null' && viaje !== 'undefined') {
            filtro.idViaje = new mongoose.Types.ObjectId(viaje); 
        }

        // Configuramos el criterio de ordenación según los parámetros recibidos
        const ordenarPor = {};
        if (sort) {
            ordenarPor[sort] = direction === 'desc' ? -1 : 1; 
        } else {
            ordenarPor['fecha'] = 1; 
        }

        // Consultamos las actividades aplicando los filtros y la ordenación establecidos
        const actividades = await Actividad.find(filtro).sort(ordenarPor);

        // Identificamos al usuario autenticado si existe en la petición
        let usuarioId = null;
        if (req.user) {
            usuarioId = req.user._id || req.user.id;
        }

        // Recuperamos las reservas existentes del usuario para el viaje especificado
        let reservasDelUsuario = [];
        if (usuarioId && viaje && viaje !== 'null' && viaje !== 'undefined') {
            reservasDelUsuario = await ReservaActividad.find({
                viaje: viaje,
                usuarioReserva: usuarioId
            });
        }

        // Procesamos las actividades para adjuntarles el estado de reserva del usuario
        const actividadesProcesadas = actividades.map(act => {
            const reservaAsociada = reservasDelUsuario.find(
                (r) => r.actividad.toString() === act._id.toString()
            );
            
            return {
                ...act.toObject(),
                yaReservada: !!reservaAsociada, 
                reservaId: reservaAsociada ? reservaAsociada._id : null
            };
        });

        // Devolvemos el listado de actividades procesadas si todo ha ido bien
        return res.status(200).json(actividadesProcesadas);

    } catch (error) {
        return res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
    }
};
// FUNCIÓN PARA OBTENER UNA ACTIVIDAD POR SU ID
const obtenerActividad = async (req, res) => {
    try {
        // Buscamos la actividad en la base de datos mediante el identificador recibido
        const actividad  = await Actividad.findById(req.params.id);
        if (!actividad) return res.status(404).json({ mensaje: "Actividad no encontrada"});
        
        // Devolvemos la actividad encontrada si todo ha ido bien
        res.status(200).json(actividad);
    } catch (error){
        res.status(500).json({ mensaje: "Error al obtener actividad", error: error.message});
    }
};

// FUNCIÓN PARA RESERVAR UNA ACTIVIDAD VINCULÁNDOLA A UN VIAJE ESPECÍFICO
const reservarActividad = async (req, res) => {
    try {
        const actividadId = req.params.id;
        const viajeId = req.params.viajeId;
        const usuarioId = req.user.id;

        // Usamos el servicio centralizado para crear la reserva
        const reservaActividadService = require("../services/reservaActividades_service");
        const nuevaReserva = await reservaActividadService.crearReserva({
            actividadId,
            viajeId,
            usuarioId
        });
        
        res.status(200).json({ mensaje: "Actividad reservada correctamente", reserva: nuevaReserva });
    } catch (error){
        const status = error.message.includes("Inicie sesión") ? 401 
                     : error.message.includes("no existe") ? 404
                     : error.message.includes("Ya estás") ? 400 : 500;
        res.status(status).json({ mensaje: error.message });
    }
};
// FUNCIÓN PARA CANCELAR LA RESERVA DE UNA ACTIVIDAD EN UN VIAJE
const cancelarReserva = async (req, res) => {
    try {
        const actividadId = req.params.id;
        const viajeId = req.params.viajeId;
        const usuarioId = req.user.id;

        // Usamos el servicio centralizado para cancelar la reserva
        const reservaActividadService = require("../services/reservaActividades_service");
        await reservaActividadService.cancelarReservaPorActividadYViaje(actividadId, viajeId, usuarioId);
        
        res.status(200).json({ mensaje: "Reserva cancelada correctamente"});
    } catch (error){
        const status = error.message.includes("Inicie sesión") ? 401 
                     : error.message.includes("No tienes una reserva") ? 404 : 500;
        res.status(status).json({ mensaje: error.message });
    }
};

// EXPORTAMOS LAS FUNCIONES DEL CONTROLADOR DE ACTIVIDADES
module.exports = { crearActividad, editarActividad, eliminarActividad, obtenerActividades, obtenerActividad, reservarActividad, cancelarReserva };