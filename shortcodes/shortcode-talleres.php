<?php
function shortcode_talleres_sorsa_cards($atts)
{
  // Inicia la salida del buffer
  ob_start();
  $atts = shortcode_atts(array(
    'post' => '', // Atributo opcional para el código del post
    'title' => '',
  ), $atts, 'talleres_sorsa_cards');
?>
  <div
    class="elementor-element elementor-element-76e0584 elementor-widget elementor-widget-artech-blog-card"
    data-id="76e0584"
    data-element_type="widget"
    id="artech-blog-card"
    data-settings='{"tc_dark_mode_responsive_hide_in_dark":"no","tc_dark_mode_responsive_hide_in_light":"no"}'
    data-widget_type="artech-blog-card.default">
    <div class="elementor-widget-container">
      <div class="artech-blog-card">
        <?php
        // Consulta personalizada para obtener los posts del custom post type "punto-de-venta"
        $args = array(
          'post_type' => 'punto_de_venta',
          'posts_per_page' => -1
        );
        // $query = new WP_Query(array(
        //   'post_type' => 'punto_de_venta',
        //   'posts_per_page' => -1
        // ));

        // Si se proporciona un código de post, agregar la condición de post__in
        if (!empty($atts['post'])) {
          // $args['post__in'] = array($atts['post']);

          // Convertir los códigos de post a un array
          $post_ids = array_map('trim', explode(',', $atts['post']));
          $post_ids = array_filter($post_ids, 'is_numeric'); // Asegurarse de que solo contenga valores numéricos
          $args['post__in'] = $post_ids;
          $args['orderby'] = 'post__in'; // Mantener el orden de los IDs especificados
        }

        $query = new WP_Query($args);

        // Verifica si hay posts
        if ($query->have_posts()):
          while ($query->have_posts()):
            $query->the_post();

            $post_id = get_the_ID();

            // Obtener el título del post
            $title = get_the_title();
            
            if (!empty($atts['title'])) {
              // Procesar el título para quitar la primera parte ("Agencia") y agregar el prefijo
              $title = trim($title); // Eliminar espacios alrededor
              $post_title_parts = explode(' ', $title, 2); // Dividir en dos partes
              if (count($post_title_parts) > 1) {
                $title = esc_html($atts['title']) . ' ' . $post_title_parts[1]; // Eliminar la primera parte y agregar el prefijo
              } else {
                $title = esc_html($atts['title']) . ' ' . $title; // Si el título solo tiene una parte
              }
            } else {
              $title = esc_html($title); // Si no se proporciona un título, usar el título original
            }

            // Obtiene los datos necesarios
            $featured_img_url = get_the_post_thumbnail_url(get_the_ID(), 'full'); // Imagen destacada
            // $title = get_the_title(); // Título del post
            $content = get_the_content(); // Contenido del post

            // $url_mapa = get_field('url_mapa'); // Campo personalizado "url_mapa"
            $url_mapa = get_post_meta($post_id, 'url_mapa', true); // Campo personalizado "url_mapa"

            // Genera el HTML con los datos obtenidos
        ?>
            <div class="post wow fadeIn slow" data-wow-delay="0.2s">
              <div class="row justify-content-between align-items-center">
                <div class="col-lg-4">
                  <a
                    target="_blank"
                    href="<?= esc_url($url_mapa); ?>"
                    class="img">
                    <img decoding="async" src="<?= esc_url($featured_img_url); ?>" alt="" />
                  </a>
                </div>

                <div class="col-lg-4">
                  <div class="info">
                    <h6 class="title">
                      <a href="<?= esc_url($url_mapa); ?>" target="_blank"><?= esc_html($title); ?></a>
                    </h6>
                    <div class="description">
                      <?= wp_kses_post($content); ?>
                    </div>
                  </div>
                </div>

                <div class="col-lg-3">

                  <a href="<?= esc_url($url_mapa); ?>" class="more-link d-none" target="_blank">
                    <span class="txt"> Ver en google maps</span>
                    <img
                      decoding="async"
                      class="arrow"
                      src="https://artech.themescamp.com/startup-agency/wp-content/uploads/sites/13/2024/03/arrow.svg"
                      alt="" />
                  </a>


                  <div class="elementor-element elementor-element-6b0f5ba e-transform btn-sorsa elementor-align-left elementor-widget elementor-widget-artech-button-animate">
                    <div class="elementor-widget-container">
                      <a href="<?= esc_url($url_mapa); ?>" class="artech-button fade-border-effect" target="_blank">
                        <span class="artech-button-content-wrapper">
                          <span class="artech-button-text">
                            Ver en google maps </span>
                          <img decoding="async" src="https://suministros.sorsa.pe/wp-content/uploads/2024/03/arrow_wh.svg" alt="" class="image">
                        </span>
                      </a>
                    </div>
                  </div>


                </div>
              </div>
            </div>
        <?php
          endwhile;
          // Restaura el post global
          wp_reset_postdata();
        endif;
        ?>
      </div> <!-- .artech-blog-card -->
    </div> <!-- .elementor-widget-container -->
  </div> <!-- .elementor-element -->
<?php
  // Retorna la salida
  return ob_get_clean();
}
add_shortcode("talleres_sorsa_cards", "shortcode_talleres_sorsa_cards");
