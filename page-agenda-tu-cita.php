<?php get_header(); ?>

<section id="agenda-tu-cita">
  <div class="container py-5">

    <!-- <div class="row">
      <div class="col-12">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores repellendus reprehenderit iusto saepe ducimus quia ad commodi suscipit inventore facilis architecto nesciunt dolores nihil sit iure itaque, soluta magni temporibus!</p>
      </div>
    </div> -->

    <div class="row">
      <div class="col-md-6">
        <!-- loader -->
        <div id="reserva" class="reserva">
          <div class="reserva-form">
            <label class="d-block">
              <span class="d-block">Taller</span>
              <select name="location" id="location" class="form-control"></select>
            </label>
            <label class="d-block mt-2">
              <span class="d-block"> Asesor de Servicio </span>
              <select name="asesora" id="asesora" class="form-control" disabled></select>
            </label>
            <input class="form-control mt-3" type="text" id="datepicker" placeholder="Selecciona una fecha" disabled>
            <div id="time-slots" style="display: none;">
              <!-- Aquí se generarán los horarios -->
            </div>
            <div id="resume" class="resume mt-2 d-none">
              <p class="h3 mb-0 text-center">Resumen de la reserva</p>
              <small class="d-block text-center">Por favor revisa los detalles de tu cita a continuación y confirma:</small>
              <table class="table table-borderless mt-2">
                <tbody>
                  <tr class="row-location">
                    <td class="ea-label">Taller</td>
                    <td class="value" data-reserva-taller></td>
                  </tr>
                  <tr class="row-service">
                    <td class="ea-label">Servicio</td>
                    <td class="value" data-reserva-cita>Reserva Cita</td>
                  </tr>
                  <tr class="row-worker">
                    <td class="ea-label">Asesor de Servicio</td>
                    <td class="value" data-reserva-asesor></td>
                  </tr>
                  <tr class="row-datetime">
                    <td class="ea-label">Fecha y hora</td>
                    <td class="value" data-reserva-fecha></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <img src="<?= get_stylesheet_directory_uri() ?>/assets/img/gif-loader.gif" alt="Image Loader" class="reserva-image-loader" width="60" height="60">
        </div>

      </div>
      <div class="col-md-6 mt-3 mt-md-0">
        <?= do_shortcode('[contact-form-7 id="467e44a" title="Reserva tu cita"]'); ?>
      </div>
    </div>
  </div>
</section>
<?php get_footer(); ?>