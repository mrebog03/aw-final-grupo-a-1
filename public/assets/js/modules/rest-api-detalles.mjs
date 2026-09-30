import { cancelarReserva } from './rest-api-alojamientos.mjs';

const baseURL_viajes       = "/api/viajes";
const baseURL_alojamientos = "/api/reservas/alojamiento";
const baseURL_actividades  = "/api/reservas/actividades";
const baseURL_gastos       = "/api/gastos";
const baseURL_tareas       = "/api/tareas";

// Utilidad interna
const fetchJSON = async (url) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
  return res.json();
};

// Obtiene todos los viajes del usuario autenticado
const obtenerViajes = async () => {
  return fetchJSON(`${baseURL_viajes}/`);
};

// Obtiene todos los detalles de un viaje en paralelo.
// Usa allSettled para que un fallo parcial no rompa el resto.
const obtenerDetallesViaje = async (viajeId) => {
  const [alojamientos, actividades, gastos, tareas] = await Promise.allSettled([
    fetchJSON(`${baseURL_alojamientos}?viaje=${viajeId}`),
    fetchJSON(`${baseURL_actividades}?viaje=${viajeId}`),
    fetchJSON(`${baseURL_gastos}?viaje=${viajeId}`),
    fetchJSON(`${baseURL_tareas}?viaje=${viajeId}`),
  ]);

  return {
    alojamientos: alojamientos.status === "fulfilled" ? alojamientos.value : [],
    actividades:  actividades.status  === "fulfilled" ? actividades.value  : [],
    gastos:       gastos.status       === "fulfilled" ? gastos.value       : [],
    tareas:       tareas.status       === "fulfilled" ? tareas.value       : [],
  };
};

export {
  obtenerViajes,
  obtenerDetallesViaje,
  cancelarReserva,   // re-exportamos para que detalles-main solo importe de un sitio
};
