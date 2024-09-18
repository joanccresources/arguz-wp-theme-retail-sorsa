(() => {
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

  const removeAndCreateDataPicker = () => {
    const datapicker = document.querySelector("#datepicker");
    if (datapicker && datapicker.parentNode) {
      datapicker.parentNode.removeChild(datapicker);
      elements.timeSlots.insertAdjacentHTML(
        "beforebegin",
        `<input class="form-control mt-3" type="text" id="datepicker" placeholder="Selecciona una fecha" disabled>`
      );
    }
  };
  // const removeContentButtonsHora = () => {
  //   const contentButtonsHora = document.querySelector("#content-data-horas");
  //   if (contentButtonsHora && contentButtonsHora.parentNode)
  //     contentButtonsHora.parentNode.removeChild(contentButtonsHora);
  // };
  const generarHorarios = ({
    inicio_horario_jornada_laboral,
    final_horario_jornada_laboral,
    tiempo_de_atencion,
    break: break_time,
  }) => {
    const horarios = [];
    const [breakInicio] = break_time.split(":").map(Number);
    const minutosAtencion = Number(tiempo_de_atencion);

    // Convertimos la hora inicial y final en minutos desde medianoche
    const [inicioHoras, inicioMinutos] = inicio_horario_jornada_laboral
      .split(":")
      .map(Number);
    const [finHoras, finMinutos] = final_horario_jornada_laboral
      .split(":")
      .map(Number);
    const inicioTotalMinutos = inicioHoras * 60 + inicioMinutos;
    const finTotalMinutos = finHoras * 60 + finMinutos;
    const breakInicioMinutos = breakInicio * 60;
    const breakFinMinutos = breakInicioMinutos + 60; // 1 hora de descanso

    // Generar los horarios
    for (
      let minutosActuales = inicioTotalMinutos;
      minutosActuales < finTotalMinutos;
      minutosActuales += minutosAtencion
    ) {
      // Omitir el rango de descanso
      if (
        minutosActuales >= breakInicioMinutos &&
        minutosActuales < breakFinMinutos
      ) {
        minutosActuales = breakFinMinutos - minutosAtencion; // Saltamos al final del break
        continue;
      }

      // Convertir los minutos de vuelta a horas y minutos
      const horas = Math.floor(minutosActuales / 60)
        .toString()
        .padStart(2, "0");
      const minutos = (minutosActuales % 60).toString().padStart(2, "0");

      horarios.push(`${horas}:${minutos}`);
    }

    return horarios;
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

    // El asesor trabaja hoy a medioTiempo?
    if (horarios.fechasDeMedioTiempo.includes(dayOfWeek.toString())) {
      const availableTimes = {
        dateStr1: [],
      };
      // inicio_horario_jornada_laboral,
      // final_horario_jornada_laboral,
      // tiempo_de_atencion,
      // break: break_time,
      availableTimes.dateStr1 = [
        ...generarHorarios({
          inicio_horario_jornada_laboral: horarios.inicio_horario_media_jornada,
          final_horario_jornada_laboral: horarios.final_horario_media_jornada,
          tiempo_de_atencion: horarios.tiempo_de_atencion,
          break: horarios.break,
        }),
      ];

      let timesHtml = `<div id="content-data-horas">`;
      availableTimes.dateStr1.forEach((time) => {
        timesHtml += `<button data-btn-horas="${time}" class="btn btn-light mx-1 mt-3">${time}</button>`;
      });
      timesHtml += "</div>";

      elements.timeSlots.innerHTML = timesHtml;
      elements.timeSlots.style.display = "block";
    } else {
      const availableTimes = {
        dateStr1: [],
      };

      availableTimes.dateStr1 = [
        ...generarHorarios({
          inicio_horario_jornada_laboral:
            horarios.inicio_horario_jornada_laboral,
          final_horario_jornada_laboral: horarios.final_horario_jornada_laboral,
          tiempo_de_atencion: horarios.tiempo_de_atencion,
          break: horarios.break,
        }),
      ];

      let timesHtml = `<div id="content-data-horas">`;
      availableTimes.dateStr1.forEach((time) => {
        timesHtml += `<button data-btn-horas="${time}" class="btn btn-light mx-1 mt-3">${time}</button>`;
      });
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
        // change Day
        showAvailableTimeSlots(dateStr);
      },
    });
    // flatpickr("#datepicker", {
    //   enableTime: true,
    //   dateFormat: "d-m-Y H:i",
    //   time_24hr: true, // Usa el formato de 24 horas
    //   minuteIncrement: 15, // Intervalo de 15 minutos
    //   minTime: "09:00", // Hora mínima
    //   maxTime: "16:00", // Hora máxima

    //   minDate: "today",
    //   disable: [
    //     function (date) {
    //       // Deshabilita el intervalo de tiempo de 13:00 a 14:00
    //       const hour = date.getHours();
    //       return hour >= 13 && hour < 14;
    //     },
    //     isDateDisabled,
    //   ], // Utiliza la función personalizada para deshabilitar fechas
    //   onChange: function (selectedDates, dateStr, instance) {
    //     showAvailableTimeSlots(dateStr);
    //   },
    // });
  };

  const loadDisabledFechas = async (asesorId) => {
    try {
      // Mostrar loader
      elements.reserva.classList.add("loader");

      const response = await fetch(`${endpoint.asesor}/${asesorId}`);
      if (!response.ok)
        throw new Error("La respuesta de la red no fue correcta");
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
      if (!response.ok)
        throw new Error("La respuesta de la red no fue correcta");

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

      const response = await fetch(
        `${endpoint.asesor}?ubicacion=${locationId}`
      );

      if (!response.ok)
        throw new Error("La respuesta de la red no fue correcta");

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

      if (!response.ok)
        throw new Error("La respuesta de la red no fue correcta");

      const data = await response.json();

      horarios.inicio_horario_jornada_laboral =
        data.inicio_horario_jornada_laboral;
      horarios.final_horario_jornada_laboral =
        data.final_horario_jornada_laboral;
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

      // Reiniciamos el dataPicker si o si
      removeAndCreateDataPicker();
      // Ocultamos los botones
      elements.timeSlots.style.display = "none";
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

      // Reiniciamos el dataPicker si o si
      removeAndCreateDataPicker();
      // Ocultamos los botones
      elements.timeSlots.style.display = "none";
      if (asesorId) {
        document.querySelector("#datepicker").removeAttribute("disabled");
        await loadDisabledFechas(asesorId);
      } else {
        document.querySelector("#datepicker").setAttribute("disabled", "");
      }
    });
  };
  const handleHoraClick = () => {
    document.addEventListener("click", (event) => {
      if (event.target.hasAttribute("data-btn-horas")) {
        const time = event.target.getAttribute("data-btn-horas");
        selectTime(time);
      }
    });
  };

  const initDomReady = () => {
    console.log("Hola Mundo Agenda");
    handleTalleresChange();
    handleAsesoresChange();
    handleHoraClick();
    loadTalleres();
  };
  addEventListener("DOMContentLoaded", () => {
    initDomReady();
  });
})();
