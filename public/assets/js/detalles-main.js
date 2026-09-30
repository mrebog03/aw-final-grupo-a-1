import * as apiDetalles  from "./modules/rest-api-detalles.mjs";
import * as htmlDetalles from "./modules/html-components-detalles.mjs";

// Registra el comportamiento de acordeón en todas las tarjetas del contenedor
const registrarToggle = (contenedor) => {
  contenedor.querySelectorAll("[data-toggle]").forEach(header => {
    header.addEventListener("click", () => {
      const id      = header.dataset.toggle;
      const body    = document.getElementById(`body-${id}`);
      const chevron = document.getElementById(`chevron-${id}`);
      const oculto  = body.style.display === "none";
      body.style.display      = oculto ? "" : "none";
      chevron.style.transform = oculto ? "rotate(180deg)" : "";
    });
  });
};

// Registra el botón de cancelar reserva de alojamiento con delegación de eventos
const registrarCancelarReserva = (contenedor) => {
  contenedor.addEventListener("click", async (event) => {
    const btn = event.target.closest(".btn-cancelar-reserva");
    if (!btn) return;

    const reservaId = btn.dataset.id;

    if (!window.confirm("¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      await apiDetalles.cancelarReserva(reservaId);
      window.alert("Reserva cancelada con éxito.");
      inicializar(); // Recarga la vista entera para que desaparezca la reserva
    } catch (err) {
      window.alert(err.message);
    }
  });
};

// Punto de entrada: carga viajes + detalles y renderiza todo
const inicializar = async () => {
  const main = document.querySelector(".main-content");
  if (!main) return;

  main.innerHTML = `
    <div class="page-header"><h3>Mis viajes — Detalles</h3></div>
    <div id="detalles-wrap"></div>
  `;

  const contenedor = document.getElementById("detalles-wrap");
  htmlDetalles.mostrarCargando(contenedor);

  let viajes;
  try {
    viajes = await apiDetalles.obtenerViajes();
  } catch (err) {
    console.error("Error al cargar viajes:", err);
    htmlDetalles.mostrarError(contenedor, "No se pudieron cargar tus viajes. ¿Estás conectado?");
    return;
  }

  if (!viajes.length) {
    htmlDetalles.mostrarVacio(contenedor);
    return;
  }

  const detalles = await Promise.all(viajes.map(v => apiDetalles.obtenerDetallesViaje(v._id)));

  contenedor.innerHTML = viajes
    .map((v, i) => htmlDetalles.createDetallesViajeCard(v, detalles[i], i === 0))
    .join("");

  registrarToggle(contenedor);
  registrarCancelarReserva(contenedor);
};

window.addEventListener("pageshow", (event) => {
  // event.persisted = true significa que viene de la caché del navegador
  inicializar();
});