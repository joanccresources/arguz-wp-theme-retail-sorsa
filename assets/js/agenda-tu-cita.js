const selectTime = (time) => {
  console.log("Horario seleccionado: " + time);
  // Aquí podrías añadir lógica para manejar la selección del horario
};
const showAvailableTimeSlots = (date) => {
  // Simulación de datos obtenidos, reemplazar por llamada AJAX si es necesario
  const availableTimes = {
    "21-09-2024": ["08:00", "08:15", "08:30", "09:45", "11:00", "11:15"],
  };

  let timesHtml = "<div>";
  if (availableTimes[date]) {
    availableTimes[date].forEach((time) => {
      timesHtml += `<button class="btn btn-light" onclick="selectTime('${time}')">${time}</button>`;
    });
  }
  timesHtml += "</div>";
  document.getElementById("time-slots").innerHTML = timesHtml;
  document.getElementById("time-slots").style.display = "block";
};

const initFlatpickr = () => {
  flatpickr("#datepicker", {
    enableTime: false,
    dateFormat: "d-m-Y",
    minDate: "today",
    onChange: function (selectedDates, dateStr, instance) {
      showAvailableTimeSlots(dateStr);
    },
  });
};

const loadTalleres = () => {
  // Hacer la petición AJAX usando fetch
  fetch(ajax_url.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: new URLSearchParams({
      action: "obtener_talleres", // Acción definida en PHP
    }),
  })
    .then(function (response) {
      console.log({ response });
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.json(); // Parsear la respuesta a JSON
    })
    .then(function (data) {
      console.log({ data });
      if (data.success) {
        // Obtener el select donde se agregarán los talleres
        const selectTalleres = document.getElementById("location");

        // Recorrer los datos recibidos y agregarlos al select
        data.data.forEach(function (taller) {
          const option = document.createElement("option");
          option.value = taller.id;
          option.textContent = taller.titulo;
          selectTalleres.appendChild(option);
        });
      } else {
        console.log("Error: " + data.data);
      }
    })
    .catch(function (error) {
      console.log({ error });
      console.log("Error en la petición AJAX:", error);
    });
};

const initDomReady = () => {
  console.log("Hola Mundo Agenda");
  initFlatpickr();
  loadTalleres();
};
addEventListener("DOMContentLoaded", () => {
  initDomReady();
});
