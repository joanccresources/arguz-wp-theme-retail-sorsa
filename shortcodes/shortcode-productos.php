<?php
function shortcode_tipo_productos_galeria($atts)
{
  ob_start();

  $terms = get_terms(array(
    'taxonomy' => 'tipo_de_producto',
    'hide_empty' => false,
    'meta_key' => 'posicion',
    'orderby' => 'meta_value_num',
    'order' => 'ASC',
  ));

  if (is_wp_error($terms) || empty($terms)) {
    echo '<p>No hay productos disponibles.</p>';
    return ob_get_clean();
  }

  echo '<div class="projects"><div class="row">';
  $count = 0;
  foreach ($terms as $term) {
    $imagen_principal_url = "";
    $imagen_principal_id = get_term_meta($term->term_id, 'imagen_principal', true);
    if ($imagen_principal_id)
      $imagen_principal_url = wp_get_attachment_url($imagen_principal_id);    
    $imagen_url = $imagen_principal_url;

    $enlace = get_term_meta($term->term_id, 'enlace', true);
    $target = $enlace !== "#0" ? '_blank' : '_self';
    
    $col_class = ($count < 3) ? 'mt-lg-0' : 'mt-lg-4';

    echo '<div class="col-12 col-md-6 col-lg-4 ' . esc_attr($col_class) . ' mt-4">';
    echo '  <a href="' . esc_url($enlace) . '" target="' . $target . '" class="project-card">';
    echo '    <div class="project-card__figure">';
    echo '      <img decoding="async" src="' . esc_url($imagen_url) . '" alt="' . esc_attr($term->name) . '" class="project-card__img" />';
    echo '    </div>';
    echo '    <div class="project-card__body">';
    echo '      <h6 class="project-card__title">' . esc_html($term->name) . '</h6>';    
    echo '      <div class="project-card__group">';
    echo '        <span class="project-card__btn">VER CATÁLOGO</span>';
    echo '      </div>';
    echo '    </div>';
    echo '  </a>';
    echo '</div>';
    $count++;
  }
  echo '</div></div>';

  return ob_get_clean();
}
add_shortcode('tipo_productos_galeria', 'shortcode_tipo_productos_galeria');
