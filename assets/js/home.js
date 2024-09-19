(() => {
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
        const yourName = document.getElementById("your-name").value;
        const yourEmail = document.getElementById("your-email").value;
        const telefono = document.getElementById("telefono").value;
        const anoModelo = document.getElementById("ano_modelo").value;
        const servicio = document.getElementById("servicio").value;
        const descripcion = document.getElementById("descripcion").value;

        const params = new URLSearchParams({
          "your-name": yourName,
          "your-email": yourEmail,
          telefono: telefono,
          ano_modelo: anoModelo,
          servicio: servicio,
          descripcion: descripcion,
        });
        const baseURL = "https://retail.sorsa.pe/agenda-tu-cita/";
        const fullURL = `${baseURL}?${params.toString()}`;
        location.href = fullURL;
      });
  };

  const initDomReady = () => {
    console.log("Hola Home");
    //
    changeSumitForm();
    validateForm();
  };
  addEventListener("DOMContentLoaded", () => {
    initDomReady();
  });
})();
