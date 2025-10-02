const inputPesos = document.getElementById("pesos");
const selectMoneda = document.getElementById("moneda");
const btnConvertir = document.getElementById("btnConvertir");
const divResultado = document.getElementById("resultado");
const ctx = document.getElementById("grafico").getContext("2d");

let chart; // para reutilizar el gráfico

// Función para obtener datos (API o JSON local)
async function getData() {
  try {
    const res = await fetch("https://mindicador.cl/api/");
    if (!res.ok) throw new Error("Error en la API online");
    return await res.json();
  } catch (error) {
    // Si falla, usamos el archivo local
    const res = await fetch("mindicador.json");
    return await res.json();
  }
}

// Evento convertir
btnConvertir.addEventListener("click", async () => {
  const data = await getData();
  const pesos = parseFloat(inputPesos.value);
  const moneda = selectMoneda.value;

  if (isNaN(pesos) || pesos <= 0) {
    divResultado.innerHTML = "⚠️ Ingresa un monto válido.";
    return;
  }

  try {
    const valorMoneda = data[moneda].valor;
    const conversion = (pesos / valorMoneda).toFixed(2);

    divResultado.innerHTML = `
      ${pesos.toLocaleString("es-CL")} CLP = 
      <strong>${conversion}</strong> ${data[moneda].nombre}
    `;

    // Historial de últimos 10 días
    const resHist = await fetch(`https://mindicador.cl/api/${moneda}`);
    const dataHist = await resHist.json();
    const ultimos10 = dataHist.serie.slice(0, 10).reverse();

    const labels = ultimos10.map(d => new Date(d.fecha).toLocaleDateString("es-CL"));
    const valores = ultimos10.map(d => d.valor);

    if (chart) chart.destroy(); // limpiar gráfico anterior

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: `Valor ${data[moneda].nombre} últimos 10 días`,
          data: valores,
          borderColor: "blue",
          fill: false,
          tension: 0.1
        }]
      }
    });

  } catch (error) {
    divResultado.innerHTML = "❌ Error al convertir: " + error.message;
  }
});
