// =============================================================================
// UTILIDADES INTERNAS
// =============================================================================

const formatFecha = (isoStr) => {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

const calcularDias = (inicio, fin) => {
  if (!inicio || !fin) return "?";
  return Math.round((new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24));
};

const totalGastos = (gastos) =>
  gastos.reduce((acc, g) => acc + (g.cantidad ?? 0), 0);

const tareasPendientes = (tareas) =>
  tareas.filter(t => !t.completada).length;

// =============================================================================
// SECCIONES INTERNAS
// =============================================================================

const htmlMiembros = (usuarios) => {
  if (!usuarios?.length)
    return "<span style='color:#718096;font-style:italic'>Sin miembros</span>";

  return usuarios.map(u => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:#f0f4ff;border-radius:999px;padding:4px 12px 4px 4px;font-size:.82rem;color:#434190;margin:2px;">
      <span style="width:26px;height:26px;border-radius:50%;background:#5a67d8;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0;">
        ${(u.nombre?.[0] ?? "?").toUpperCase()}
      </span>
      ${u.nombre ?? u.email}
    </span>
  `).join("");
};

const htmlAlojamientos = (lista) => {
  if (!lista.length)
    return "<p style='color:#718096;font-style:italic;margin:4px 0'>No hay alojamientos reservados.</p>";

  return lista.map(r => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:10px;border-radius:8px;background:#f8fafc;margin-bottom:6px;">
      <i class="fa-solid fa-hotel" style="color:#5a67d8;margin-top:2px;width:16px;text-align:center;"></i>
      <div style="flex:1;font-size:.85rem;color:#4a5568;">
        <strong style="color:#2d3748;display:block;">${r.alojamiento?.nombre ?? "Alojamiento"}</strong>
        <span>${r.alojamiento?.ciudad ?? ""}</span>
        <span style="display:block;font-size:.78rem;color:#718096;">
          ${formatFecha(r.fechaEntrada)} → ${formatFecha(r.fechaSalida)} · ${r.huespedes ?? "?"} huéspedes
        </span>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
        <span style="background:#e6fffa;color:#276749;font-size:.75rem;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap;">
          €${(r.precioTotal ?? 0).toLocaleString("es-ES")}
        </span>
        <button class="btn-cancelar-reserva" data-id="${r._id}"
          style="padding:4px 8px;font-size:0.7rem;margin:0;min-width:auto;border:none;background-color:#f56565;color:white;border-radius:6px;cursor:pointer;">
          <i class="fa-solid fa-trash"></i> Cancelar
        </button>
      </div>
    </div>
  `).join("");
};

const COLORES_ESTADO = {
  confirmado: "background:#c6f6d5;color:#22543d",
  pendiente:  "background:#fefcbf;color:#7b6002",
  cancelado:  "background:#fed7d7;color:#742a2a",
};

const htmlActividades = (lista) => {
  if (!lista.length)
    return "<p style='color:#718096;font-style:italic;margin:4px 0'>No hay actividades reservadas.</p>";

  return lista.map(r => {
    const estilo = COLORES_ESTADO[r.estado] ?? COLORES_ESTADO.pendiente;
    return `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:10px;border-radius:8px;background:#f8fafc;margin-bottom:6px;">
        <i class="fa-solid fa-person-hiking" style="color:#5a67d8;margin-top:2px;width:16px;text-align:center;"></i>
        <div style="flex:1;font-size:.85rem;color:#4a5568;">
          <strong style="color:#2d3748;display:block;">${r.actividad?.nombre ?? "Actividad"}</strong>
          <span>${formatFecha(r.fechaReserva)} · ${r.participantes ?? "?"} participantes</span>
        </div>
        <span style="${estilo};font-size:.75rem;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap;text-transform:capitalize;">
          ${r.estado ?? "pendiente"}
        </span>
      </div>
    `;
  }).join("");
};

const htmlGastos = (lista) => {
  if (!lista.length)
    return "<p style='color:#718096;font-style:italic;margin:4px 0'>No hay gastos registrados.</p>";

  return lista.map(g => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:10px;border-radius:8px;background:#f8fafc;margin-bottom:6px;">
      <i class="fa-solid fa-coins" style="color:#5a67d8;margin-top:2px;width:16px;text-align:center;"></i>
      <div style="flex:1;font-size:.85rem;color:#4a5568;">
        <strong style="color:#2d3748;display:block;">${g.descripcion ?? "Gasto"}</strong>
        ${g.categoria
          ? `<span style="font-size:.75rem;background:#fefcbf;color:#744210;border-radius:4px;padding:1px 6px;">${g.categoria}</span>`
          : ""}
        <span style="display:block;">Pagado por <em>${g.pagadoPor?.nombre ?? "?"}</em></span>
      </div>
      <span style="background:#e6fffa;color:#276749;font-size:.75rem;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap;">
        €${(g.cantidad ?? 0).toLocaleString("es-ES")}
      </span>
    </div>
  `).join("");
};

const htmlTareas = (lista) => {
  if (!lista.length)
    return "<p style='color:#718096;font-style:italic;margin:4px 0'>No hay tareas asignadas.</p>";

  return lista.map(t => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:10px;border-radius:8px;background:#f8fafc;margin-bottom:6px;${t.completada ? "opacity:.55" : ""}">
      <i class="fa-solid ${t.completada ? "fa-circle-check" : "fa-circle-xmark"}"
         style="color:${t.completada ? "#48bb78" : "#f56565"};margin-top:2px;width:16px;text-align:center;"></i>
      <div style="flex:1;font-size:.85rem;color:#4a5568;">
        <strong style="color:#2d3748;display:block;${t.completada ? "text-decoration:line-through" : ""}">
          ${t.descripcion ?? "Tarea"}
        </strong>
        ${t.actividad ? `<span>${t.actividad.nombre}</span>` : ""}
      </div>
      <span style="${t.completada ? "background:#c6f6d5;color:#22543d" : "background:#fefcbf;color:#7b6002"};font-size:.75rem;font-weight:700;padding:3px 8px;border-radius:999px;white-space:nowrap;">
        ${t.completada ? "Completada" : "Pendiente"}
      </span>
    </div>
  `).join("");
};

// =============================================================================
// BLOQUES COMPUESTOS
// =============================================================================

const htmlResumen = (viaje, detalles) => {
  const dias       = calcularDias(viaje.fecha_inicio, viaje.fecha_fin);
  const gasto      = totalGastos(detalles.gastos);
  const pendientes = tareasPendientes(detalles.tareas);

  const chip = (icono, valor, texto) =>
    `<span style="display:inline-flex;align-items:center;gap:6px;background:#f7fafc;border:1px solid #e2e8f0;border-radius:999px;padding:5px 12px;font-size:.8rem;color:#4a5568;">
      <i class="${icono}" style="color:#5a67d8;"></i>
      <strong style="color:#2d3748;">${valor}</strong> ${texto}
    </span>`;

  return `
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
      ${chip("fa-solid fa-calendar-days", dias, "días")}
      ${chip("fa-solid fa-users", viaje.usuariosApuntados?.length ?? 0, "miembros")}
      ${chip("fa-solid fa-hotel", detalles.alojamientos.length, "alojamientos")}
      ${chip("fa-solid fa-person-hiking", detalles.actividades.length, "actividades")}
      ${chip("fa-solid fa-coins", "€" + gasto.toLocaleString("es-ES"), "gastados")}
      ${chip("fa-solid fa-list-check", pendientes, "tareas pendientes")}
    </div>
  `;
};

const htmlSeccion = (icono, titulo, contenido) => `
  <div style="margin-bottom:20px;">
    <h4 style="font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#a0aec0;margin:0 0 10px;display:flex;align-items:center;gap:6px;">
      <i class="${icono}" style="color:#5a67d8;"></i> ${titulo}
    </h4>
    ${contenido}
  </div>
`;

// =============================================================================
// COMPONENTES PÚBLICOS EXPORTADOS
// =============================================================================

/**
 * Genera el HTML completo de la tarjeta de un viaje con todos sus detalles
 * @param {Object} viaje
 * @param {{ alojamientos, actividades, gastos, tareas }} detalles
 * @param {boolean} expandido - Si el acordeón arranca abierto
 */
const createDetallesViajeCard = (viaje, detalles, expandido = false) => {
  const id      = viaje._id;
  const totalG  = totalGastos(detalles.gastos);
  const creador = viaje.usuariosApuntados?.find(
    u => u._id?.toString() === viaje.creadoPor?.toString()
  );

  return `
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:20px;">

      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:18px 24px;cursor:pointer;user-select:none;"
           data-toggle="${id}">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
          <i class="fa-solid fa-plane-departure" style="color:#5a67d8;font-size:1.1rem;"></i>
          <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:#2d3748;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${viaje.titulo ?? "Viaje sin nombre"}
          </h3>
          <span style="font-size:.7rem;background:#ebf4ff;color:#3182ce;border-radius:6px;padding:2px 8px;font-family:monospace;font-weight:700;white-space:nowrap;">
            ${viaje.codigo ?? ""}
          </span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px 20px;font-size:.83rem;color:#718096;flex-basis:100%;">
          <span><i class="fa-regular fa-calendar"></i> ${formatFecha(viaje.fecha_inicio)} → ${formatFecha(viaje.fecha_fin)}</span>
          <span>Creado por <strong style="color:#4a5568;">${creador?.nombre ?? "?"}</strong></span>
        </div>
        <i class="fa-solid fa-chevron-down" id="chevron-${id}"
           style="color:#a0aec0;transition:transform .25s;margin-left:auto;${expandido ? "transform:rotate(180deg)" : ""}"></i>
      </div>

      <div id="body-${id}" style="padding:0 24px 24px;border-top:1px solid #edf2f7;${expandido ? "" : "display:none"}">
        ${htmlResumen(viaje, detalles)}
        ${htmlSeccion("fa-solid fa-users",        "Miembros",     `<div style="display:flex;flex-wrap:wrap;gap:6px;">${htmlMiembros(viaje.usuariosApuntados)}</div>`)}
        ${htmlSeccion("fa-solid fa-hotel",         "Alojamientos", htmlAlojamientos(detalles.alojamientos))}
        ${htmlSeccion("fa-solid fa-person-hiking", "Actividades",  htmlActividades(detalles.actividades))}
        ${htmlSeccion("fa-solid fa-coins",         "Gastos",
          htmlGastos(detalles.gastos) +
          (detalles.gastos.length
            ? `<p style="text-align:right;font-size:.9rem;color:#4a5568;margin:6px 0 0;">Total: <strong>€${totalG.toLocaleString("es-ES")}</strong></p>`
            : "")
        )}
        ${htmlSeccion("fa-solid fa-list-check",    "Tareas",       htmlTareas(detalles.tareas))}
      </div>

    </div>
  `;
};

/**
 * Renderiza el estado de carga en el contenedor
 * @param {HTMLElement} contenedor
 */
const mostrarCargando = (contenedor) => {
  contenedor.innerHTML = `
    <div class="card" style="text-align:center;padding:60px 20px;color:#718096;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem;margin-bottom:16px;display:block;color:#5a67d8;"></i>
      <p>Cargando tus viajes...</p>
    </div>`;
};

/**
 * Renderiza un mensaje de error en el contenedor
 * @param {HTMLElement} contenedor
 * @param {string} msg
 */
const mostrarError = (contenedor, msg) => {
  contenedor.innerHTML = `
    <div class="card" style="text-align:center;padding:60px 20px;color:#c53030;">
      <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;margin-bottom:16px;display:block;"></i>
      <p>${msg}</p>
    </div>`;
};

/**
 * Renderiza el estado vacío (sin viajes) en el contenedor
 * @param {HTMLElement} contenedor
 */
const mostrarVacio = (contenedor) => {
  contenedor.innerHTML = `
    <div class="card" style="text-align:center;padding:60px 20px;color:#718096;">
      <i class="fa-solid fa-plane-slash" style="font-size:2rem;margin-bottom:16px;display:block;color:#5a67d8;"></i>
      <p>Aún no estás apuntado a ningún viaje.</p>
    </div>`;
};

export {
  createDetallesViajeCard,
  mostrarCargando,
  mostrarError,
  mostrarVacio,
};
