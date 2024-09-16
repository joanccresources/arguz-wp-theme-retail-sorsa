const domain = "https://retail.sorsa.pe/wp-json/wp/v2";
const endpoint = {
  asesor: `${domain}/asesor`,
  ubicacion: `${domain}/ubicacion`,
};

const elements = {
  reserva: document.getElementById("reserva"),
  datepicker: document.getElementById("datepicker"),
  location: document.getElementById("location"),
  asesora: document.getElementById("asesora"),
  timeSlots: document.getElementById("time-slots"),
};

let horarios = {
  // Asesor
  fechasDeMedioTiempo: [],
  // Ubicacion
  inicio_horario_jornada_laboral: "",
  final_horario_jornada_laboral: "",
  tiempo_de_atencion: "",
  break: "",
  inicio_horario_media_jornada: "",
  final_horario_media_jornada: "",
};

const selectTime = (time) => {
  console.log("Horario seleccionado: " + time);
  document.querySelectorAll("[data-btn-horas]").forEach((btn) => {
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-light");
  });
  const btnActive = document.querySelector(`[data-btn-horas="${time}"]`);
  btnActive.classList.remove("btn-light");
  btnActive.classList.add("btn-primary");

  // Aquí podrías añadir lógica para manejar la selección del horario
};
const showAvailableTimeSlots = (dateStr) => {
  console.log({ horarios });

  // Dividir la cadena de fecha en partes (día, mes, año)
  const [day, month, year] = dateStr.split("-").map(Number);
  // Crear un objeto Date con el formato correcto (nota: los meses en JavaScript son 0-indexados)
  const selectedDate = new Date(year, month - 1, day);
  // Obtén el número del día de la semana
  const dayOfWeek = selectedDate.getDay();
  console.log("Día de la semana:", dayOfWeek);

  // if (horarios.fechasDeMedioTiempo === dayOfWeek) {
  if (horarios.fechasDeMedioTiempo.includes(dayOfWeek.toString())) {
    const availableTimes = {
      dateStr1: [
        "08:00",
        "08:15",
        "08:30",
        "08:45",

        "09:00",
        "09:15",
        "09:30",
        "09:45",

        "10:00",
        "10:15",
        "10:30",
        "10:45",

        "11:00",
        "11:15",
        "11:30",
        "11:45",
      ],
    };
    let timesHtml = `<div>`;
    // if (availableTimes[date]) {
    // availableTimes[date].forEach((time) => {
    availableTimes.dateStr1.forEach((time) => {
      timesHtml += `<button data-btn-horas="${time}" class="btn btn-light mx-1 mt-3" onclick="selectTime('${time}')">${time}</button>`;
    });
    // }
    timesHtml += "</div>";
    elements.timeSlots.innerHTML = timesHtml;
    elements.timeSlots.style.display = "block";
  } else {
    const availableTimes = {
      dateStr1: [
        "08:00",
        "08:15",
        "08:30",
        "08:45",

        "09:00",
        "09:15",
        "09:30",
        "09:45",

        "10:00",
        "10:15",
        "10:30",
        "10:45",

        "11:00",
        "11:15",
        "11:30",
        "11:45",

        "12:00",
        "12:15",
        "12:30",
        "12:45",

        "14:00",
        "14:15",
        "14:30",
        "14:45",

        "15:00",
        "15:15",
        "15:30",
        "15:45",
      ],
    };
    let timesHtml = "<div>";
    // if (availableTimes[date]) {
    // availableTimes[date].forEach((time) => {
    availableTimes.dateStr1.forEach((time) => {
      timesHtml += `<button data-btn-horas="${time}" class="btn btn-light mx-1 mt-3" onclick="selectTime('${time}')">${time}</button>`;
    });
    // }
    timesHtml += "</div>";
    elements.timeSlots.innerHTML = timesHtml;
    elements.timeSlots.style.display = "block";
  }

  // const availableTimes = {
  //   "21-09-2024": ["08:00", "08:15", "08:30", "09:45", "11:00", "11:15"],
  // };
  // let timesHtml = "<div>";
  // if (availableTimes[date]) {
  //   availableTimes[date].forEach((time) => {
  //     timesHtml += `<button class="btn btn-light" onclick="selectTime('${time}')">${time}</button>`;
  //   });
  // }
  // timesHtml += "</div>";
  // elements.timeSlots.innerHTML = timesHtml;
  // elements.timeSlots.style.display = "block";
};

const initFlatpickr = async (isDateDisabled = "") => {
  flatpickr("#datepicker", {
    enableTime: false,
    dateFormat: "d-m-Y",
    minDate: "today",
    disable: [isDateDisabled], // Utiliza la función personalizada para deshabilitar fechas
    onChange: function (selectedDates, dateStr, instance) {
      showAvailableTimeSlots(dateStr);
    },
  });
};

const loadDisabledFechas = async (asesorId) => {
  try {
    // Mostrar loader
    elements.reserva.classList.add("loader");

    const response = await fetch(`${endpoint.asesor}/${asesorId}`);
    if (!response.ok) throw new Error("La respuesta de la red no fue correcta");
    const data = await response.json();

    // Función para convertir las fechas a objetos Date
    const parseDate = (dateString) => {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const noHabilitadoParaTrabajar = [...data.no_habilitado_para_trabajar];
    const fechasDeDescanso = [...data.fechas_de_descanso]; // 0 para domingos, 1 para lunes, etc.
    horarios.fechasDeMedioTiempo = [...data.fechas_de_medio_tiempo];

    const fechasNoHabilitadas = noHabilitadoParaTrabajar.map(parseDate);

    // Función para verificar si una fecha es un día no habilitado o de descanso
    const isDateDisabled = (date) => {
      // Verificar si la fecha está en la lista de fechas no habilitadas
      if (
        fechasNoHabilitadas.some(
          (d) => d.toDateString() === date.toDateString()
        )
      )
        return true;
      // Verificar si la fecha es un día de descanso
      const dayOfWeek = date.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
      if (fechasDeDescanso.includes(dayOfWeek.toString())) return true;

      return false;
    };
    initFlatpickr(isDateDisabled);
  } catch (error) {
    console.error("Hubo un problema con la solicitud Fetch:", error);
  } finally {
    // Ocultar loader
    elements.reserva.classList.remove("loader");
  }
};
const loadTalleres = async () => {
  try {
    // Mostrar loader
    elements.reserva.classList.add("loader");

    // Realizar la solicitud fetch al endpoint
    const response = await fetch(endpoint.ubicacion);

    // Verificar si la respuesta es correcta
    if (!response.ok) throw new Error("La respuesta de la red no fue correcta");

    // Parsear la respuesta como JSON
    const data = await response.json();

    // Iterar sobre los objetos y extraer los títulos y id
    let optionsHtml = `<option value selected="selected">-</option>`;
    data.forEach((item) => {
      optionsHtml += `<option value="${item.id}">${item.name}</option>`;
    });
    elements.location.innerHTML = optionsHtml;
  } catch (error) {
    // Manejar cualquier error que ocurra
    console.error("Hubo un problema con la solicitud Fetch:", error);
  } finally {
    // Ocultar loader
    elements.reserva.classList.remove("loader");
  }
};
const loadAsesores = async (locationId) => {
  try {
    // Mostrar loader
    elements.reserva.classList.add("loader");

    const response = await fetch(`${endpoint.asesor}?ubicacion=${locationId}`);

    if (!response.ok) throw new Error("La respuesta de la red no fue correcta");

    const data = await response.json();

    let optionsHtml = `<option value="" selected="selected">-</option>`;
    data.forEach((item) => {
      optionsHtml += `<option value="${item.id}">${item.title.rendered}</option>`;
    });

    elements.asesora.innerHTML = optionsHtml;
  } catch (error) {
    console.error("Hubo un problema con la solicitud Fetch:", error);
  } finally {
    // Ocultar loader
    elements.reserva.classList.remove("loader");
  }
};

const getAllDataTaller = async (locationId) => {
  try {
    // Mostrar loader
    elements.reserva.classList.add("loader");

    const response = await fetch(`${endpoint.ubicacion}/${locationId}`);

    if (!response.ok) throw new Error("La respuesta de la red no fue correcta");

    const data = await response.json();

    horarios.inicio_horario_jornada_laboral =
      data.inicio_horario_jornada_laboral;
    horarios.final_horario_jornada_laboral = data.final_horario_jornada_laboral;
    horarios.tiempo_de_atencion = data.tiempo_de_atencion;
    horarios.break = data.break;
    horarios.inicio_horario_media_jornada = data.inicio_horario_media_jornada;
    horarios.final_horario_media_jornada = data.final_horario_media_jornada;
  } catch (error) {
    console.error("Hubo un problema con la solicitud Fetch:", error);
  } finally {
    // Ocultar loader
    elements.reserva.classList.remove("loader");
  }
};

const handleTalleresChange = () => {
  elements.location.addEventListener("change", async function () {
    const locationId = this.value;
    if (locationId) {
      elements.asesora.removeAttribute("disabled");
      await loadAsesores(locationId); // Cargar asesores según la ubicación seleccionada
      // Obtenemos el tiempo del taller
      await getAllDataTaller(locationId);
    } else {
      elements.asesora.setAttribute("disabled", "");
    }
  });
};
const handleAsesoresChange = () => {
  elements.asesora.addEventListener("change", async function () {
    const asesorId = this.value;
    if (asesorId) {
      elements.datepicker.removeAttribute("disabled");
      await loadDisabledFechas(asesorId);
    } else {
      elements.datepicker.setAttribute("disabled", "");
    }
  });
};

const handleHoraClick = () => {
  elements.timeSlots.addEventListener("click", async function (event) {
    console.log(event.target);
    // const asesorId = this.value;
    // if (asesorId) {
    //   elements.datepicker.removeAttribute("disabled");
    //   await loadDisabledFechas(asesorId);
    // } else {
    //   elements.datepicker.setAttribute("disabled", "");
    // }
  });
};

const initDomReady = () => {
  console.log("Hola Mundo Agenda");
  handleTalleresChange();
  handleAsesoresChange();
  loadTalleres();
};
addEventListener("DOMContentLoaded", () => {
  initDomReady();
});
