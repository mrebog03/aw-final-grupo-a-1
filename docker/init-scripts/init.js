// Conexión a la base de datos y autenticación
var adminDb = db.getSiblingDB("admin");
adminDb.auth("root", "12341234");

db = db.getSiblingDB("aw-final-grupo-a-1");

// 1. Eliminar las colecciones con los nombres PLURALIZADOS exactos que crea Mongoose
db.usuarios.drop();
db.viajes.drop();
db.gastos.drop();
db.actividads.drop(); // Mongoose pluraliza actividad -> actividads
db.alojamientos.drop();
db.reservaactividads.drop(); // Mongoose pluraliza reservaactividades -> reservaactividads
db.reservaalojamientos.drop();
db.tareas.drop();

print("Colecciones duplicadas limpiadas con éxito. Creando nuevos datos...");

// 2. Contraseña por defecto para todos los usuarios de prueba: "viajes1234"
var hashViajes1234 = "$2b$10$knCQUQ1DKgRqKpodHzgCEOpZJGTsEeIgZXOf9z2WIS.BDTgLMaIi6";

db.usuarios.insertMany([
  {
    nombre: "Usuario Admin",
    email: "admin@viajes.com",
    password: hashViajes1234, 
    rol: "Admin"
  },
  {
    nombre: "Usuario Cliente 1",
    email: "cliente1@viajes.com",
    password: hashViajes1234, 
    rol: "Cliente"
  },
  {
    nombre: "Usuario Cliente 2",
    email: "cliente2@viajes.com",
    password: hashViajes1234,
    rol: "Cliente"
  },
  {
    nombre: "Usuario Cliente 3",
    email: "cliente3@viajes.com",
    password: hashViajes1234,
    rol: "Cliente"
  }
]);

print('Usuarios inicializados correctamente.');

// Obtener los IDs de los usuarios insertados
const adminId = db.usuarios.findOne({ email: "admin@viajes.com" })._id;
const cliente1Id = db.usuarios.findOne({ email: "cliente1@viajes.com" })._id;
const cliente2Id = db.usuarios.findOne({ email: "cliente2@viajes.com" })._id;
const cliente3Id = db.usuarios.findOne({ email: "cliente3@viajes.com" })._id;

// 3. Insertar Alojamientos Disponibles en el catálogo
db.alojamientos.insertMany([
  {
    nombre: "Hotel Le Lumière",
    descripcion: "Hermoso hotel boutique cerca del centro con vistas espectaculares.",
    ciudad: "París",
    direccion: "12 Rue de la Paix, 75002 Paris",
    capacidad: 4,
    extras: ["Wifi", "Piscina", "Aire Acond."],
    precioNoche: 120,
    imagenes: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"]
  },
  {
    nombre: "Colosseum Luxury Rooms",
    descripcion: "Habitaciones modernas a solo 5 minutes andando del Coliseo.",
    ciudad: "Roma",
    direccion: "Via dei Fori Imperiali, 00184 Roma",
    capacidad: 2,
    extras: ["Wifi", "Desayuno", "Piscina"],
    precioNoche: 95,
    imagenes: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4"]
  },
  {
    nombre: "Shibuya Crossing Apartment",
    descripcion: "Estudio tecnológico y céntrico ideal para explorar la ciudad.",
    ciudad: "Tokio",
    direccion: "2 Chome-2-1 Dogenzaka, Shibuya, Tokyo",
    capacidad: 3,
    extras: ["Wifi", "Parking", "Aire Acond."],
    precioNoche: 150,
    imagenes: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]
  }
]);
print("Alojamientos añadidos al catálogo");

const hotelParisId = db.alojamientos.findOne({ ciudad: "París" })._id;
const hotelRomaId = db.alojamientos.findOne({ ciudad: "Roma" })._id;
const hotelTokioId = db.alojamientos.findOne({ ciudad: "Tokio" })._id;

// 4. Insertar Viajes Iniciales
db.viajes.insertMany([
  {
    titulo: "Ruta del Arte en París",
    descripcion: "Viaje cultural para visitar museos y pasear por el Sena.",
    fecha_inicio: new Date("2026-07-15"),
    fecha_fin: new Date("2026-07-22"),
    creadoPor: cliente1Id,
    usuariosApuntados: [cliente1Id, cliente2Id, adminId],
    gastosHechos: [],
    actividadesReservadas: [],
    codigo: "A7K9M2QX"
  },
  {
    titulo: "Aventura Express en Roma",
    descripcion: "Ruta gastronómica e histórica de fin de semana.",
    fecha_inicio: new Date("2026-09-10"),
    fecha_fin: new Date("2026-09-14"),
    creadoPor: cliente2Id,
    usuariosApuntados: [cliente2Id, cliente3Id, adminId],
    gastosHechos: [],
    actividadesReservadas: [],
    codigo: "R4T8ZP6L"
  },
  {
    titulo: "Explorando el Futuro en Tokio",
    descripcion: "Descubriendo templos antiguos y rascacielos llenos de luces.",
    fecha_inicio: new Date("2026-11-01"),
    fecha_fin: new Date("2026-11-12"),
    creadoPor: cliente3Id,
    usuariosApuntados: [cliente1Id, cliente3Id, adminId],
    gastosHechos: [],
    actividadesReservadas: [],
    codigo: "N5C2V9BD"
  }
]);
print("Viajes iniciales creados");

const viajeParisId = db.viajes.findOne({ codigo: "A7K9M2QX" })._id;
const viajeRomaId = db.viajes.findOne({ codigo: "R4T8ZP6L" })._id;
const viajeTokioId = db.viajes.findOne({ codigo: "N5C2V9BD" })._id;

// 5. Insertar Actividades ligadas a la colección pluralizada por Mongoose
db.actividads.insertMany([
  {
    nombre: "Entradas Museo del Louvre",
    descripcion: "Entrada general con acceso sin colas a las exposiciones permanentes.",
    fecha: new Date("2026-07-16T10:00:00Z"),
    lugar: "Rue de Rivoli, 75001 Paris",
    precio: 22,
    capacidad: 30,
    idViaje: viajeParisId
  },
  {
    nombre: "Tour Guiado por el Coliseo y Foro Romano",
    descripcion: "Guía oficial especializado en historia romana.",
    fecha: new Date("2026-09-11T09:30:00Z"),
    lugar: "Piazza del Colosseo, Roma",
    precio: 45,
    capacidad: 15,
    idViaje: viajeRomaId
  },
  {
    nombre: "Excursión al Monte Fuji",
    descripcion: "Autobús de ida y vuelta con parada en los lagos y miradores.",
    fecha: new Date("2026-11-04T07:00:00Z"),
    lugar: "Estación de Shibuya (Salida Hachiko)",
    precio: 80,
    capacidad: 40,
    idViaje: viajeTokioId
  }
]);
print("Actividades asignadas");

const actLouvreId = db.actividads.findOne({ nombre: "Entradas Museo del Louvre" })._id;
const actColiseoId = db.actividads.findOne({ nombre: "Tour Guiado por el Coliseo y Foro Romano" })._id;
const actFujiId = db.actividads.findOne({ nombre: "Excursión al Monte Fuji" })._id;

// 6. Insertar Gastos
db.gastos.insertMany([
  {
    viaje: viajeParisId,
    descripcion: "Vuelos RyanAir Barcelona-París (Ida y vuelta)",
    cantidad: 145.20,
    categoria: "Transporte",
    pagadoPor: cliente1Id,
    fecha: new Date("2026-05-10")
  },
  {
    viaje: viajeParisId,
    descripcion: "Cena romántica en Montmartre",
    cantidad: 68.50,
    categoria: "Comida",
    pagadoPor: cliente2Id,
    fecha: new Date("2026-07-16")
  },
  {
    viaje: viajeRomaId,
    descripcion: "Billetes de tren express aeropuerto",
    cantidad: 28.00,
    categoria: "Transporte",
    pagadoPor: cliente2Id,
    fecha: new Date("2026-09-10")
  }
]);
print("Gastos registrados");

const gastoVueloId = db.gastos.findOne({ descripcion: /Vuelos RyanAir/ })._id;
const gastoCenaId = db.gastos.findOne({ descripcion: /Cena romántica/ })._id;

// 7. Actualizar referencias cruzadas
db.viajes.updateOne({ _id: viajeParisId }, { $push: { gastosHechos: { $each: [gastoVueloId, gastoCenaId] }, actividadesReservadas: actLouvreId } });
db.viajes.updateOne({ _id: viajeRomaId }, { $push: { actividadesReservadas: actColiseoId } });
db.viajes.updateOne({ _id: viajeTokioId }, { $push: { actividadesReservadas: actFujiId } });

// 8. Crear Reservas de Actividades en la colección pluralizada por Mongoose
db.reservaactividads.insertMany([
  {
    actividad: actLouvreId,
    viaje: viajeParisId,
    usuarioReserva: cliente1Id,
    fechaReserva: new Date(),
    participantes: 2,
    precioTotal: 44
  }
]);

// 9. Crear Reservas de Alojamientos
db.reservaalojamientos.insertMany([
  {
    alojamiento: hotelParisId,
    viaje: viajeParisId,
    usuarioReserva: cliente1Id,
    fechaEntrada: new Date("2026-07-15"),
    fechaSalida: new Date("2026-07-22"),
    huespedes: 2,
    precioTotal: 840,
    estado: "confirmada"
  },
  {
    alojamiento: hotelRomaId,
    viaje: viajeRomaId,
    usuarioReserva: cliente2Id,
    fechaEntrada: new Date("2026-09-10"),
    fechaSalida: new Date("2026-09-14"),
    huespedes: 1,
    precioTotal: 380,
    estado: "pendiente"
  }
]);

// 10. Crear Tareas
db.tareas.insertMany([
  { viaje: viajeParisId, actividad: actLouvreId, descripcion: "Imprimir o guardar en PDF las entradas del Louvre", completada: false },
  { viaje: viajeParisId, actividad: actLouvreId, descripcion: "Comprar adaptador de enchufes para el hotel", completada: true },
  { viaje: viajeRomaId, actividad: actColiseoId, descripcion: "Revisar la política de vestimenta para la visita al Vaticano", completada: false }
]);

print("¡Inicialización completada!");