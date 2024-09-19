(() => {
  const domain = "https://retail.sorsa.pe/wp-json/wp/v2";
  const domainReserva = "https://retail.sorsa.pe/wp-json/asesores/v1";
  const endpoint = {
    asesor: `${domain}/asesor`,
    ubicacion: `${domain}/ubicacion`,
    reservar: `${domainReserva}/reservar`,
    disponibilidad: `${domainReserva}/disponibilidad`,
  };

  const elements = {
    reserva: document.getElementById("reserva"),
    datepicker: document.getElementById("datepicker"),
    location: document.getElementById("location"),
    asesora: document.getElementById("asesora"),
    timeSlots: document.getElementById("time-slots"),
    formularioAgenda: document.querySelector(".formulario-agenda"),
    // Resume tabla
    resumeContent: document.getElementById("resume"),
    resumeTaller: document.querySelector("#resume [data-reserva-taller]"),
    resumeAsesor: document.querySelector("#resume [data-reserva-asesor]"),
    resumeFechaHora: document.querySelector("#resume [data-reserva-fecha]"),
    // ContactForm
    yourSubject: document.getElementById("your-subject"),
    yourTaller: document.getElementById("your-taller"),
    yourAsesor: document.getElementById("your-asesor"),
    yourFechaHora: document.getElementById("your-fecha-hora"),
  };

  let horarios = {
    // Asesor
    asesor_id: 0, // Seleccion
    fechasDeMedioTiempo: [],
    // Ubicacion
    inicio_horario_jornada_laboral: "",
    final_horario_jornada_laboral: "",
    tiempo_de_atencion: "",
    break: "",
    inicio_horario_media_jornada: "",
    final_horario_media_jornada: "",
    // Seleccion
    fecha_reservada: "",
    hora_reservada: "",
  };

  // Obtenemos hora y minuto actual
  const getCurrentTime = () => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0"); // Obtiene las horas (0-23)
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Obtiene los minutos (0-59)
    return `${hours}:${minutes}`;
  };
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Asegura que el mes tenga dos dígitos
    const day = String(date.getDate()).padStart(2, "0"); // Asegura que el día tenga dos dígitos

    return `${year}-${month}-${day}`;
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
  const generarHorarios = ({
    inicio_horario_jornada_laboral,
    final_horario_jornada_laboral,
    tiempo_de_atencion,
    break: break_time,
    selectedDate,
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

    // Obtener la hora actual en minutos desde medianoche
    const [currentHours, currentMinutes] = getCurrentTime()
      .split(":")
      .map(Number);
    const currentTotalMinutos = currentHours * 60 + currentMinutes;

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

      const horaGenerada = `${horas}:${minutos}`;

      // Solo agregar si es igual o mayor a la hora actual siempre y cuando la fecha que asigno es la misma que hoy
      // Sino normal cualquier hora es posible""
      if (selectedDate === getCurrentDate()) {
        if (minutosActuales >= currentTotalMinutos) {
          horarios.push(horaGenerada);
        }
      } else {
        horarios.push(horaGenerada);
      }
    }
    return horarios;
  };
  const completeselectTime = (btnActive) => {
    console.log({ horarios });

    elements.formularioAgenda.classList.add("active");
    elements.resumeContent.classList.remove("d-none");

    const txtInputTaller = Array.from(
      elements.location.querySelectorAll("option")
    ).find((item) => item.selected === true).textContent;
    const txtInputAsesor = Array.from(
      elements.asesora.querySelectorAll("option")
    ).find((item) => item.selected === true).textContent;
    const txtFechaHora =
      document.getElementById("datepicker").value + " " + btnActive.textContent;

    elements.resumeTaller.textContent = txtInputTaller;
    elements.resumeAsesor.textContent = txtInputAsesor;
    elements.resumeFechaHora.textContent = txtFechaHora;

    elements.yourSubject.value = document.title;
    elements.yourTaller.value = txtInputTaller;
    elements.yourAsesor.value = txtInputAsesor;
    elements.yourFechaHora.value = txtFechaHora;
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

    horarios.hora_reservada = time;
    // Aquí podrías añadir lógica para manejar la selección del horario
    completeselectTime(btnActive);
  };

  const showAvailableTimeSlots = (horas) => {
    let timesHtml = `<div id="content-data-horas">`;
    horas.forEach((time) => {
      timesHtml += `<button style="${
        time.success
          ? ""
          : "pointer-events: none !important;opacity: .25 !important;"
      }" data-btn-horas="${time.hora}" class="btn btn-light mx-1 mt-3">${
        time.hora
      }</button>`;
    });
    timesHtml += "</div>";
    elements.timeSlots.innerHTML = timesHtml;
    elements.timeSlots.style.display = "block";
  };

  const loadDisabledHoras = async (dateStr) => {
    // Dividir la cadena de fecha en partes (día, mes, año)
    const [day, month, year] = dateStr.split("-").map(Number);
    // Crear un objeto Date con el formato correcto (nota: los meses en JavaScript son 0-indexados)
    const selectedDate = new Date(year, month - 1, day);
    // Obtén el número del día de la semana
    const dayOfWeek = selectedDate.getDay();

    // Para el endpoint
    const [d, m, y] = dateStr.split("-");
    const selectedDateFormat = `${y}-${m}-${d}`;

    let horas = [];
    // El asesor trabaja hoy a medioTiempo?
    if (horarios.fechasDeMedioTiempo.includes(dayOfWeek.toString())) {
      horas = [
        ...generarHorarios({
          inicio_horario_jornada_laboral: horarios.inicio_horario_media_jornada,
          final_horario_jornada_laboral: horarios.final_horario_media_jornada,
          tiempo_de_atencion: horarios.tiempo_de_atencion,
          break: horarios.break,
          selectedDate: selectedDateFormat,
        }),
      ];
    } else {
      horas = [
        ...generarHorarios({
          inicio_horario_jornada_laboral:
            horarios.inicio_horario_jornada_laboral,
          final_horario_jornada_laboral: horarios.final_horario_jornada_laboral,
          tiempo_de_atencion: horarios.tiempo_de_atencion,
          break: horarios.break,
          selectedDate: selectedDateFormat,
        }),
      ];
    }
    console.log({ horas });
    try {
      // Mostrar loader
      elements.reserva.classList.add("loader");

      const promesas = horas.map((hora) =>
        fetch(
          `${endpoint.disponibilidad}?asesor_id=${horarios.asesor_id}&fecha=${selectedDateFormat}&hora_inicio=${hora}`
        )
      );

      // Ejecutar todas las solicitudes en paralelo con Promise.all
      const responses = await Promise.all(promesas);

      // Verificar y obtener los datos de cada respuesta
      const datos = await Promise.all(
        responses.map((response) => {
          // if (!response.ok) {
          //   throw new Error(
          //     `Error en la solicitud para la hora ${response.url}: ${response.status}`
          //   );
          // }
          const dataJson = response.json();
          if (dataJson.success === false) {
            throw new Error(
              `Error en la solicitud para la hora ${response.url}: ${response.status}`
            );
          }
          return dataJson; // Convertir cada respuesta a JSON
        })
      );

      horas = horas.map((hora, i) => {
        return {
          hora,
          success: datos[i].success,
        };
      });

      horarios.fecha_reservada = selectedDateFormat;
      showAvailableTimeSlots(horas);
    } catch (error) {
      console.error("Hubo un problema con la solicitud Fetch:", error);
    } finally {
      // Ocultar loader
      elements.reserva.classList.remove("loader");
    }
  };

  const initFlatpickr = async (isDateDisabled = "") => {
    flatpickr("#datepicker", {
      enableTime: false,
      dateFormat: "d-m-Y",
      minDate: "today",
      disable: [isDateDisabled], // Utiliza la función personalizada para deshabilitar fechas
      onChange: function (selectedDates, dateStr, instance) {
        // change Day
        // Ocultamos el formulario derecho
        elements.formularioAgenda.classList.remove("active");
        // Ocultamos la tabla de resume
        elements.resumeContent.classList.add("d-none");
        loadDisabledHoras(dateStr);
      },
    });
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
      horarios.asesor_id = parseInt(asesorId);

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
      // Ocultamos el formulario derecho
      elements.formularioAgenda.classList.remove("active");
      // Ocultamos la tabla de resume
      elements.resumeContent.classList.add("d-none");
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
      // Ocultamos el formulario derecho
      elements.formularioAgenda.classList.remove("active");
      // Ocultamos la tabla de resume
      elements.resumeContent.classList.add("d-none");
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

  const insertErrorAlert = (message) => {
    document.querySelector("#alert-success-form")?.remove();
    document.querySelector("#alert-error-form")?.remove();

    const $container = document.querySelector("#btn-send-form-reserva");
    if (!$container) return;
    const $alertHtml = `
  <div class="alert alert-danger mb-0 mt-2" role="alert" id="alert-error-form">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    ${message}
  </div>
  `;
    $container.insertAdjacentHTML("afterend", $alertHtml);
    const $btnClose = document.querySelector("#alert-error-form button");
    $btnClose &&
      $btnClose.addEventListener("click", () => {
        document.querySelector("#alert-error-form").remove();
      });
  };

  const insertSuccessAlert = (message) => {
    document.querySelector("#alert-success-form")?.remove();
    document.querySelector("#alert-error-form")?.remove();

    const $container = document.querySelector("#btn-send-form-reserva");
    if (!$container) return;
    const $alertHtml = `
  <div class="alert alert-success mb-0 mt-2" role="alert" id="alert-success-form">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    ${message}
  </div>
  `;
    $container.insertAdjacentHTML("afterend", $alertHtml);
    const $btnSuccess = document.querySelector("#alert-success-form button");
    $btnSuccess &&
      $btnSuccess.addEventListener("click", () => {
        document.querySelector("#alert-success-form").remove();
      });
  };

  const validateForm = () => {
    const $form = document.querySelector(".formulario-agenda");
    let cont;
    const $btnSend = document.querySelector("#btn-send-form-reserva");
    if (!$form || !$btnSend) return;

    const validate = () => {
      cont = 0;
      const $inputs = $form.querySelectorAll(
        "input:not([type='hidden'],[type='submit'])"
      );
      Array.from($inputs).forEach(($input) => {
        if ($input.value.trim().length === 0) cont++;
      });

      cont > 0
        ? $btnSend.classList.add("no-validate")
        : $btnSend.classList.remove("no-validate");
    };
    const addEvents = () => {
      const $inputs = $form.querySelectorAll("input");
      Array.from($inputs).forEach(($input) => {
        $input.addEventListener("keydown", validate);
        $input.addEventListener("keyup", validate);
        $input.addEventListener("focus", validate);
        $input.addEventListener("blur", validate);
      });
    };

    validate();
    addEvents();
  };

  const changeSumitForm = () => {
    const btnSubmit = document.querySelector(
      `.formulario-agenda input[type="submit"]`
    );
    if (!btnSubmit) return;

    const htmlButton = `<button type="button" class="btn-send-form-reserva" id="btn-send-form-reserva" class="btn-send-form-reserva">Enviar</button>`;

    btnSubmit.insertAdjacentHTML("afterend", htmlButton);
    btnSubmit.classList.add("d-none");

    const btnReserva = document.querySelector("#btn-send-form-reserva");

    btnReserva &&
      btnReserva.addEventListener("click", () => {
        const data = {
          asesor_id: horarios.asesor_id,
          fecha: horarios.fecha_reservada,
          hora_inicio: horarios.hora_reservada,
          hora_fin: "23:00",
          nombre_cliente: document.getElementById("nombre").value,
          correo_cliente: document.getElementById("correo").value,
        };
        console.log({ data });

        // Registrar Formulario y dar error en caso estea mal
        const reservarAsesor = async () => {
          try {
            document.querySelector("#form-reserva").classList.add("loader");

            const response = await fetch(endpoint.reservar, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            });

            // Parseamos la respuesta a JSON
            const respuestaJSON = await response.json();

            if (respuestaJSON.success === false) {
              throw new Error(respuestaJSON.message);
            }
            insertSuccessAlert(respuestaJSON.message);
          } catch (error) {
            insertErrorAlert(error);
          } finally {
            document.querySelector("#form-reserva").classList.remove("loader");
          }
        };

        reservarAsesor();
      });
  };

  const initDomReady = () => {
    console.log("Hola Mundo Agenda");
    handleTalleresChange();
    handleAsesoresChange();
    handleHoraClick();
    loadTalleres();
    //
    changeSumitForm();
    validateForm();
  };
  addEventListener("DOMContentLoaded", () => {
    initDomReady();
  });
})();
