<?php
// Función para manejar la petición AJAX
function obtener_talleres()
{
  // Comprobar que el usuario tiene permisos adecuados
  if (! current_user_can('edit_posts')) {
    wp_send_json_error('No tienes permisos para realizar esta acción');
    wp_die();
  }

  // Crear una instancia de WP_Query para obtener los posts del tipo 'taller'
  $query = new WP_Query(array(
    'post_type' => 'taller',
    'posts_per_page' => -1, // Obtener todos los posts
    'post_status' => 'publish' // Solo obtener los publicados
  ));

  // Verificar si hay talleres
  if ($query->have_posts()) {
    $data = array();

    // Recorrer los posts y preparar los datos
    while ($query->have_posts()) {
      $query->the_post();
      $data[] = array(
        'id' => get_the_ID(),
        'titulo' => get_the_title()
      );
    }

    // Restablecer la consulta global de WordPress
    wp_reset_postdata();

    // Devolver los datos en formato JSON
    wp_send_json_success($data);
  } else {
    wp_send_json_error('No se encontraron talleres');
  }

  wp_die(); // Finalizar la petición
}

// Registrar la acción AJAX para usuarios autenticados
add_action('wp_ajax_obtener_talleres', 'obtener_talleres');

// Registrar la acción AJAX para usuarios no autenticados
add_action('wp_ajax_nopriv_obtener_talleres', 'obtener_talleres');
