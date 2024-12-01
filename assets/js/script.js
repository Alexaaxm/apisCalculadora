const result = document.querySelector("#result");
let myChart = null;

async function getMonedasNacional() {
  const res = await fetch("https://mindicador.cl/api/");
  const moneda = await res.json();
  return moneda;
}

const onFormSubmit = async (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const formData = Object.fromEntries(data.entries());
  const moneda = formData.moneda;
  const monto = formData.monto;
  renderGrafica(moneda);
  const resultado = await convierteMoneda(moneda, monto);

  if (resultado === false) {
    result.innerHTML = "Hubo un problema obteniendo el resultado";
  } else {
    result.innerHTML = `Resultado: ${resultado.toFixed(2)} ${moneda}`;
  }
};

async function convierteMoneda(tipoMoneda, monto) {
  let monedas;
  try {
    monedas = await getMonedasNacional();
  } catch (e) {
    return false;
  }
  const moneda = monedas[tipoMoneda];
  const valor = moneda.valor;
  const resultado = monto / valor;
  return resultado;
}

async function getTipoMonedaMensual(tipoMoneda) {
  const res = await fetch(`https://mindicador.cl/api/${tipoMoneda}`);
  const grafico = await res.json();
  return grafico;
}

function prepararConfiguracionParaLaGrafica(data) {
  const serie = data.serie.reverse();

  const labels = serie.map((value) =>
    new Date(value.fecha).toLocaleDateString("es")
  );
  const values = serie.map((value) => value.valor);
  const config = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: data.nombre,
          backgroundColor: "red",
          data: values,
        },
      ],
    },
  };
  return config;
}

async function renderGrafica(tipoMoneda) {
  const monedas = await getTipoMonedaMensual(tipoMoneda);
  const config = prepararConfiguracionParaLaGrafica(monedas);
  const chartDOM = document.getElementById("myChart");

  if (!myChart) {
    myChart = new Chart(chartDOM, config);
  } else {
    myChart.data = config.data;
    myChart.update();
  }
}
