const STORAGE_KEY = "control_financiero_nov2026_v1";

const DEFAULT_DATA = {
  ingresos: 1500.00,
  limiteSemanal: 90.00,
  diarios: [
    { id: 1, fecha: "2026-11-01", categoria: "Víveres", descripcion: "Compras inicio de mes", monto: 22.50 },
    { id: 2, fecha: "2026-11-02", categoria: "Víveres", descripcion: "Despensa semanal", monto: 9.00 },
    { id: 3, fecha: "2026-11-03", categoria: "Almuerzo", descripcion: "Menú del día", monto: 8.50 },
    { id: 4, fecha: "2026-11-04", categoria: "Almuerzo", descripcion: "Almuerzo y bebida", monto: 10.00 },
    { id: 5, fecha: "2026-11-05", categoria: "Víveres", descripcion: "Compras jueves", monto: 28.50 },
    { id: 6, fecha: "2026-11-06", categoria: "Taxi", descripcion: "Movilidad y almuerzo", monto: 38.20 },
    { id: 7, fecha: "2026-11-07", categoria: "Otros", descripcion: "Gasto sábado", monto: 2.50 },
    { id: 8, fecha: "2026-11-08", categoria: "Taxi", descripcion: "Traslado domingo", monto: 2.50 },
    { id: 9, fecha: "2026-11-09", categoria: "Víveres", descripcion: "Frutas y abarrotes", monto: 15.00 },
    { id: 10, fecha: "2026-11-10", categoria: "Víveres", descripcion: "Supermercado", monto: 35.10 },
    { id: 11, fecha: "2026-11-11", categoria: "Almuerzo", descripcion: "Almuerzo y café", monto: 20.00 },
    { id: 12, fecha: "2026-11-12", categoria: "Víveres", descripcion: "Compras jueves", monto: 39.30 },
    { id: 13, fecha: "2026-11-13", categoria: "Taxi", descripcion: "Carreras viernes", monto: 30.70 }
  ],
  fijos: [
    { id: 101, concepto: "Alquiler", aPagar: 235.00, pagado: 235.00 },
    { id: 102, concepto: "Licencia Office", aPagar: 26.90, pagado: 0.00 },
    { id: 103, concepto: "Línea Entel", aPagar: 30.00, pagado: 30.00 },
    { id: 104, concepto: "Tesis", aPagar: 100.00, pagado: 0.00 },
    { id: 105, concepto: "Comida en el trabajo", aPagar: 190.00, pagado: 153.15 },
    { id: 106, concepto: "Compras del mes", aPagar: 80.00, pagado: 134.82 },
    { id: 107, concepto: "Pago a reemplazo", aPagar: 80.00, pagado: 80.00 },
    { id: 108, concepto: "Taxis durante el mes", aPagar: 70.00, pagado: 36.00 }
  ],
  prestamos: [
    { id: 201, persona: "Lalangui", tipo: "Préstamo", medio: "Efectivo", monto: 25.00, estado: "Pendiente" },
    { id: 202, persona: "Royber", tipo: "Préstamo", medio: "Yape", monto: 30.00, estado: "Pagado" },
    { id: 203, persona: "Geiner", tipo: "Préstamo", medio: "Efectivo", monto: 20.00, estado: "Pendiente" },
    { id: 204, persona: "Madre", tipo: "Deuda", medio: "Yape", monto: 50.00, estado: "Pendiente" },
    { id: 205, persona: "Deuda Yape disponible", tipo: "Deuda Yape", medio: "Yape", monto: 93.19, estado: "Pendiente" }
  ]
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(DEFAULT_DATA);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatSoles(num) {
  return `S/ ${Number(num || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function getDateInfo(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diaNombre = dias[dateObj.getDay()];
  const semana = Math.min(5, Math.ceil(d / 7));
  return { diaNombre, dayIndex: dateObj.getDay(), semana };
}

/* ==================== NAVEGACIÓN DE PESTAÑAS ==================== */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

/* ==================== RENDER PRINCIPAL ==================== */
function renderAll() {
  renderKPIsAndCharts();
  renderDiariosTable();
  renderFijosTable();
  renderPrestamosTable();
}

function renderKPIsAndCharts() {
  const inputIngresos = document.getElementById("inputIngresos");
  const inputLimite = document.getElementById("inputLimiteSemanal");
  inputIngresos.value = state.ingresos.toFixed(2);
  inputLimite.value = state.limiteSemanal;

  const totalVariables = state.diarios.reduce((acc, item) => acc + item.monto, 0);
  const totalFijosAPagar = state.fijos.reduce((acc, item) => acc + item.aPagar, 0);
  const totalFijosPagado = state.fijos.reduce((acc, item) => acc + item.pagado, 0);
  const totalFijosPendiente = Math.max(0, totalFijosAPagar - totalFijosPagado);

  const saldoDisponible = state.ingresos - (totalVariables + totalFijosAPagar);

  document.getElementById("kpiVariables").textContent = formatSoles(totalVariables);
  document.getElementById("kpiVariablesSub").textContent = `${state.diarios.length} registros en noviembre`;

  document.getElementById("kpiFijos").textContent = formatSoles(totalFijosAPagar);
  document.getElementById("kpiFijosSub").textContent = `Pagado: ${formatSoles(totalFijosPagado)} • Pendiente: ${formatSoles(totalFijosPendiente)}`;

  const kpiSaldo = document.getElementById("kpiSaldo");
  kpiSaldo.textContent = formatSoles(saldoDisponible);
  kpiSaldo.className = `kpi-value ${saldoDisponible >= 0 ? "text-green" : "text-red"}`;

  // Gráfico Semanal
  const semanasTotales = [0, 0, 0, 0, 0];
  state.diarios.forEach((item) => {
    const { semana } = getDateInfo(item.fecha);
    semanasTotales[semana - 1] += item.monto;
  });

  const limite = Number(state.limiteSemanal) || 90;
  const maxVal = Math.max(limite * 1.2, ...semanasTotales, 10);
  const limitPercent = Math.min(100, (limite / maxVal) * 100);

  const chartSemanal = document.getElementById("chartSemanal");
  chartSemanal.innerHTML = `
    <div class="limit-line" style="bottom: ${limitPercent}%">
      <span class="limit-tag">Límite: ${formatSoles(limite)}</span>
    </div>
    ${semanasTotales
      .map((val, idx) => {
        const heightPct = Math.min(100, (val / maxVal) * 100);
        const over = val > limite;
        return `
          <div class="week-col">
            <span class="week-amount ${over ? "text-red" : ""}">${val.toFixed(1)}</span>
            <div class="week-bar ${over ? "over-limit" : ""}" style="height: ${heightPct}%"></div>
            <span class="week-label">Semana ${idx + 1}</span>
          </div>
        `;
      })
      .join("")}
  `;

  // Gráfico por Día de la Semana
  const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const totalesDias = [0, 0, 0, 0, 0, 0, 0];
  state.diarios.forEach((item) => {
    const { dayIndex } = getDateInfo(item.fecha);
    totalesDias[dayIndex] += item.monto;
  });

  const maxDia = Math.max(...totalesDias, 1);
  document.getElementById("chartDias").innerHTML = nombresDias
    .map((nombre, i) => {
      const pct = (totalesDias[i] / maxDia) * 100;
      return `
        <div class="day-row">
          <span>${nombre}</span>
          <div class="day-track">
            <div class="day-fill" style="width: ${pct}%"></div>
          </div>
          <span class="day-val">${formatSoles(totalesDias[i])}</span>
        </div>
      `;
    })
    .join("");

  // Desglose por Categoría
  const catMap = {};
  state.diarios.forEach((item) => {
    catMap[item.categoria] = (catMap[item.categoria] || 0) + item.monto;
  });

  document.getElementById("categoryBars").innerHTML = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([cat, monto]) => `
      <div class="cat-chip">
        <span>${cat}</span>
        <strong>${formatSoles(monto)}</strong>
      </div>
    `
    )
    .join("");
}

/* ==================== TABLA DE GASTOS DIARIOS ==================== */
function getDateInfo(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const dayIndex = dateObj.getDay(); // 0 = Domingo, 6 = Sábado
  const diaNombre = dias[dayIndex];

  // Calcula la semana real del mes empezando en Domingo
  const primerDiaMes = new Date(y, m - 1, 1).getDay();
  const semana = Math.ceil((d + primerDiaMes) / 7);

  return { diaNombre, dayIndex, semana };
}


function renderDiariosTable() {
  const filtroSemana = document.getElementById("filtroSemana").value;
  const filtroDia = document.getElementById("filtroDia").value;
  const filtroCat = document.getElementById("filtroCategoria").value;

  const filtrados = state.diarios
    .filter((item) => {
      const { semana, dayIndex } = getDateInfo(item.fecha);

      const matchSemana = filtroSemana === "todas" || String(semana) === filtroSemana;
      const matchDia = filtroDia === "todos" || String(dayIndex) === filtroDia;
      const matchCat = filtroCat === "todas" || item.categoria === filtroCat;

      return matchSemana && matchDia && matchCat;
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const tbody = document.getElementById("tbodyDiarios");
  let suma = 0;

  if (filtrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="color: var(--text-secondary); padding: 1.5rem;">
          No hay gastos registrados para esta combinación de semana y día.
        </td>
      </tr>
    `;
    document.getElementById("totalDiariosFiltrado").textContent = formatSoles(0);
    return;
  }

  tbody.innerHTML = filtrados
    .map((item) => {
      suma += item.monto;
      const { diaNombre, semana } = getDateInfo(item.fecha);
      const isHigh = item.monto > 20;
      return `
        <tr class="${isHigh ? "row-high-expense" : ""}">
          <td>${item.fecha}</td>
          <td>${diaNombre}</td>
          <td>Semana ${semana}</td>
          <td><span class="cat-pill">${item.categoria}</span></td>
          <td>${item.descripcion}</td>
          <td class="text-right"><strong>${formatSoles(item.monto)}</strong></td>
          <td class="text-center">
            <button class="btn btn-danger-outline btn-sm" onclick="eliminarDiario(${item.id})">Eliminar</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("totalDiariosFiltrado").textContent = formatSoles(suma);
}

/* ==================== TABLA DE GASTOS FIJOS ==================== */
function renderFijosTable() {
  const tbody = document.getElementById("tbodyFijos");
  let sumPagar = 0;
  let sumPagado = 0;
  let sumRestante = 0;

  tbody.innerHTML = state.fijos
    .map((item) => {
      const restante = Math.max(0, item.aPagar - item.pagado);
      const isPaid = restante === 0;
      sumPagar += item.aPagar;
      sumPagado += item.pagado;
      sumRestante += restante;

      return `
        <tr>
          <td><strong>${item.concepto}</strong></td>
          <td class="text-right">${formatSoles(item.aPagar)}</td>
          <td class="text-right">${formatSoles(item.pagado)}</td>
          <td class="text-right">${formatSoles(restante)}</td>
          <td class="text-center">
            <span class="badge ${isPaid ? "badge-paid" : "badge-pending"}" onclick="togglePagoFijo(${item.id})" title="Clic para alternar pago">
              ${isPaid ? "Pagado" : "Pendiente"}
            </span>
          </td>
          <td class="text-center">
            <button class="btn btn-danger-outline btn-sm" onclick="eliminarFijo(${item.id})">X</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("totalFijosPagar").textContent = formatSoles(sumPagar);
  document.getElementById("totalFijosPagado").textContent = formatSoles(sumPagado);
  document.getElementById("totalFijosRestante").textContent = formatSoles(sumRestante);
}

document.getElementById("filtroSemana").addEventListener("change", renderDiariosTable);
document.getElementById("filtroDia").addEventListener("change", renderDiariosTable);
document.getElementById("filtroCategoria").addEventListener("change", renderDiariosTable);


/* ==================== TABLA DE PRÉSTAMOS / YAPE ==================== */
function renderPrestamosTable() {
  const tbody = document.getElementById("tbodyPrestamos");
  let totalPendiente = 0;

  tbody.innerHTML = state.prestamos
    .map((item) => {
      if (item.estado === "Pendiente") totalPendiente += item.monto;
      const isPaid = item.estado === "Pagado";

      return `
        <tr>
          <td><strong>${item.persona}</strong></td>
          <td>${item.tipo}</td>
          <td>${item.medio}</td>
          <td class="text-right">${formatSoles(item.monto)}</td>
          <td class="text-center">
            <span class="badge ${isPaid ? "badge-paid" : "badge-pending"}" onclick="toggleEstadoPrestamo(${item.id})" title="Clic para cambiar estado">
              ${item.estado}
            </span>
          </td>
          <td class="text-center">
            <button class="btn btn-danger-outline btn-sm" onclick="eliminarPrestamo(${item.id})">X</button>
          </td>
        </tr>
      `;
    })
    .join("");

  document.getElementById("totalPrestamosPendiente").textContent = formatSoles(totalPendiente);
}

/* ==================== EVENTOS E INTERACCIONES ==================== */
document.getElementById("inputIngresos").addEventListener("change", (e) => {
  state.ingresos = Math.max(0, parseFloat(e.target.value) || 0);
  saveState();
  renderKPIsAndCharts();
});

document.getElementById("inputLimiteSemanal").addEventListener("change", (e) => {
  state.limiteSemanal = Math.max(10, parseFloat(e.target.value) || 90);
  saveState();
  renderKPIsAndCharts();
});

document.getElementById("formGastoDiario").addEventListener("submit", (e) => {
  e.preventDefault();
  const fecha = document.getElementById("gastoFecha").value;
  const categoria = document.getElementById("gastoCategoria").value;
  const descripcion = document.getElementById("gastoDescripcion").value.trim();
  const monto = parseFloat(document.getElementById("gastoMonto").value);

  if (!fecha || !descripcion || isNaN(monto) || monto <= 0) return;

  state.diarios.push({
    id: Date.now(),
    fecha,
    categoria,
    descripcion,
    monto
  });

  e.target.reset();
  document.getElementById("gastoFecha").value = fecha;
  saveState();
  renderAll();
});

document.getElementById("filtroSemana").addEventListener("change", renderDiariosTable);
document.getElementById("filtroCategoria").addEventListener("change", renderDiariosTable);

document.getElementById("formGastoFijo").addEventListener("submit", (e) => {
  e.preventDefault();
  const concepto = document.getElementById("fijoConcepto").value.trim();
  const aPagar = parseFloat(document.getElementById("fijoMonto").value);
  if (!concepto || isNaN(aPagar) || aPagar <= 0) return;

  state.fijos.push({
    id: Date.now(),
    concepto,
    aPagar,
    pagado: 0
  });

  e.target.reset();
  saveState();
  renderAll();
});

document.getElementById("formPrestamo").addEventListener("submit", (e) => {
  e.preventDefault();
  const persona = document.getElementById("prestamoPersona").value.trim();
  const tipo = document.getElementById("prestamoTipo").value;
  const medio = document.getElementById("prestamoMedio").value;
  const monto = parseFloat(document.getElementById("prestamoMonto").value);
  if (!persona || isNaN(monto) || monto <= 0) return;

  state.prestamos.push({
    id: Date.now(),
    persona,
    tipo,
    medio,
    monto,
    estado: "Pendiente"
  });

  e.target.reset();
  saveState();
  renderAll();
});

/* Funciones globales para botones en tablas */
window.eliminarDiario = (id) => {
  state.diarios = state.diarios.filter((item) => item.id !== id);
  saveState();
  renderAll();
};

window.togglePagoFijo = (id) => {
  const item = state.fijos.find((f) => f.id === id);
  if (!item) return;
  item.pagado = item.pagado >= item.aPagar ? 0 : item.aPagar;
  saveState();
  renderAll();
};

window.eliminarFijo = (id) => {
  state.fijos = state.fijos.filter((f) => f.id !== id);
  saveState();
  renderAll();
};

window.toggleEstadoPrestamo = (id) => {
  const item = state.prestamos.find((p) => p.id === id);
  if (!item) return;
  item.estado = item.estado === "Pagado" ? "Pendiente" : "Pagado";
  saveState();
  renderAll();
};

window.eliminarPrestamo = (id) => {
  state.prestamos = state.prestamos.filter((p) => p.id !== id);
  saveState();
  renderAll();
};

/* Exportar CSV y Restaurar */
document.getElementById("btnExportCsv").addEventListener("click", () => {
  const rows = [
    ["Tipo", "Fecha", "Categoria/Concepto", "Descripcion/Medio", "Monto (S/)", "Estado"],
    ...state.diarios.map((d) => ["Gasto Diario", d.fecha, d.categoria, d.descripcion, d.monto.toFixed(2), "Registrado"]),
    ...state.fijos.map((f) => ["Gasto Fijo", "2026-11", f.concepto, `Pagado: ${f.pagado.toFixed(2)}`, f.aPagar.toFixed(2), f.pagado >= f.aPagar ? "Pagado" : "Pendiente"]),
    ...state.prestamos.map((p) => [p.tipo, "2026-11", p.persona, p.medio, p.monto.toFixed(2), p.estado])
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "control_financiero_nov2026.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
});

document.getElementById("btnResetData").addEventListener("click", () => {
  if (confirm("¿Seguro que deseas restaurar los valores iniciales de noviembre 2026?")) {
    state = structuredClone(DEFAULT_DATA);
    saveState();
    renderAll();
  }
});

function actualizarFechaActual() {
  const ahora = new Date();

  const meses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];

  const dias = [
    "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
  ];

  const mesActual = meses[ahora.getMonth()];
  const diaSemana = dias[ahora.getDay()];
  const numeroDia = ahora.getDate();
  const anio = ahora.getFullYear();

  const dateEl = document.getElementById("date-str");
  const dayEl = document.getElementById("day-str");

  if (dateEl) dateEl.textContent = `${mesActual} - ${anio}`;
  if (dayEl) dayEl.textContent = `${diaSemana}, ${numeroDia}`;
}

// Ejecutar al cargar la página
actualizarFechaActual();

// Inicializar aplicación
renderAll();