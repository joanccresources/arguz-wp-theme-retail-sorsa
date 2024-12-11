<?php

/*** Editor clasico ***/
add_filter('use_block_editor_for_post', '__return_false', 10);

add_action('wp_enqueue_scripts', 'artech_child_theme_styles', 3);
function artech_child_theme_styles()
{
  wp_enqueue_script('main-script', get_stylesheet_directory_uri() . '/assets/js/main.js?v=' . time(), array(), null, true);
  // if (is_page("home")) {
  //     wp_enqueue_script('home-script', get_stylesheet_directory_uri() . '/assets/js/home.js?v=' . time(), array(), null, true);
  // }
  if (is_page("agenda-tu-cita")) {
    // Agregar el CSS de Flatpickr
    wp_enqueue_style('flatpickr-css', 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css');
    // Agregar el script de Flatpickr
    wp_enqueue_script('flatpickr-script', 'https://cdn.jsdelivr.net/npm/flatpickr', array(), null, true);

    // wp_enqueue_script('agendar-script', get_stylesheet_directory_uri() . '/assets/js/agenda-tu-cita.js?v=' . time(), array(), null, true);
    wp_enqueue_script('ajax-talleres', get_stylesheet_directory_uri() . '/assets/js/agenda-tu-cita.js?v=' . time(), array(), null, true);
    // Pasar la URL de admin-ajax.php a tu archivo JS
    wp_localize_script('ajax-talleres', 'ajax_url', array(
      'url' => admin_url('admin-ajax.php')
    ));
  }
  if (is_front_page()) {
    wp_enqueue_script('home-script', get_stylesheet_directory_uri() . '/assets/js/home.js?v=' . time(), array(), null, true);
  }

  wp_enqueue_style('artech-parent-style', get_template_directory_uri() . '/style.css', array('bootstrap'));
  wp_enqueue_style('artech-child-style', get_stylesheet_uri(), array('artech-parent-style'));
}

require_once get_stylesheet_directory() . '/shortcodes/shortcode-home.php';
require_once get_stylesheet_directory() . '/shortcodes/shortcode-talleres.php';

// 
require_once get_stylesheet_directory() . '/helpers/agenda/talleres.php';

// https://chatgpt.com/share/66e84d69-5354-800c-b008-db0cc0672a80

// DATABASE****************************************************************
// Se crea Tabla de Reservas
function crear_tabla_reservas()
{
  global $wpdb;

  $tabla_reservas = $wpdb->prefix . 'reservas';
  $charset_collate = $wpdb->get_charset_collate();

  $sql = "CREATE TABLE IF NOT EXISTS $tabla_reservas (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        asesor_id bigint(20) unsigned NOT NULL,
        fecha date NOT NULL,
        hora_inicio time NOT NULL,
        hora_fin time NOT NULL,
        nombre_cliente varchar(255) NOT NULL,
        correo_cliente varchar(255) NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (asesor_id) REFERENCES {$wpdb->prefix}posts(ID) ON DELETE CASCADE
    ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);
}
// register_activation_hook(__FILE__, 'crear_tabla_reservas');
add_action('after_setup_theme', 'crear_tabla_reservas');
// Temporalmente, puedes usar esto en functions.php para crear la tabla
// add_action('init', 'crear_tabla_reservas');

// Insertar una reserva
function insertar_reserva($asesor_id, $fecha, $hora_inicio, $hora_fin, $nombre_cliente, $correo_cliente)
{
  global $wpdb;

  $tabla_reservas = $wpdb->prefix . 'reservas'; // Nombre de tu tabla de reservas

  $resultado = $wpdb->insert(
    $tabla_reservas,
    array(
      'asesor_id' => $asesor_id,
      'fecha' => $fecha,
      'hora_inicio' => $hora_inicio,
      'hora_fin' => !empty($hora_fin) ? $hora_fin : null, // Inserta null si hora_fin está vacío
      'nombre_cliente' => $nombre_cliente,
      'correo_cliente' => $correo_cliente,
    ),
    array('%d', '%s', '%s', '%s', '%s', '%s')  // Formatos: %d para números, %s para strings
  );
  return $resultado !== false;
}
// Validar disponibilidad antes de la reserva
function verificar_disponibilidad($asesor_id, $fecha, $hora_inicio, $hora_fin)
{
  global $wpdb;

  $tabla_reservas = $wpdb->prefix . 'reservas';

  $existe_reserva = $wpdb->get_var(
    $wpdb->prepare(
      "SELECT COUNT(*) FROM $tabla_reservas WHERE asesor_id = %d AND fecha = %s AND hora_inicio = %s",
      $asesor_id,
      $fecha,
      $hora_inicio
    )
  );
  return $existe_reserva == 0; // Devuelve true si no hay reserva
}


// AGREGANDO AL ADMIN****************************************************************
function agregar_menu_reservas()
{
  add_menu_page(
    'Reservas de Asesores',     // Título de la página
    'Reservas',                 // Título del menú
    'manage_options',           // Capacidad requerida
    'reservas-asesores',        // Slug del menú
    'mostrar_reservas',         // Función callback
    'dashicons-calendar',       // Icono del menú
    20                          // Posición en el menú
  );
}
add_action('admin_menu', 'agregar_menu_reservas');

function mostrar_reservas()
{
  global $wpdb;

  $tabla_reservas = $wpdb->prefix . 'reservas';
  $tabla_asesores = $wpdb->prefix . 'posts';  // Tabla donde están los asesores

  // Si se envía una solicitud para eliminar una reserva
  if (isset($_GET['eliminar_reserva'])) {
    $reserva_id = intval($_GET['eliminar_reserva']);
    $wpdb->delete($tabla_reservas, array('id' => $reserva_id));
    echo '<div class="notice notice-success is-dismissible"><p>Reserva eliminada exitosamente.</p></div>';
  }

  // Obtener filtros de búsqueda
  $busqueda = isset($_GET['busqueda']) ? sanitize_text_field($_GET['busqueda']) : '';
  $fecha_filtro = isset($_GET['fecha']) ? sanitize_text_field($_GET['fecha']) : '';

  // Parámetros de paginación
  $results_per_page = 10; // Número de resultados por página
  $current_page = isset($_GET['paged']) ? intval($_GET['paged']) : 1;
  $offset = ($current_page - 1) * $results_per_page;

  // Consulta SQL para contar registros
  $where_clauses = [];
  $where_params = [];

  if (!empty($busqueda)) {
    $where_clauses[] = "(a.post_title LIKE %s OR r.nombre_cliente LIKE %s)";
    $where_params[] = '%' . $wpdb->esc_like($busqueda) . '%';
    $where_params[] = '%' . $wpdb->esc_like($busqueda) . '%';
  }
  if (!empty($fecha_filtro)) {
    $where_clauses[] = "r.fecha = %s";
    $where_params[] = $fecha_filtro;
  }

  $where_sql = !empty($where_clauses) ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

  $count_query = "
        SELECT COUNT(*) 
        FROM $tabla_reservas r
        INNER JOIN $tabla_asesores a ON r.asesor_id = a.ID
        $where_sql
    ";
  $total_results = $wpdb->get_var($wpdb->prepare($count_query, ...$where_params));
  $total_pages = ceil($total_results / $results_per_page);

  // Consulta SQL con paginación
  $query = "
        SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.nombre_cliente, r.correo_cliente, a.post_title AS asesor, a.ID AS asesor_id
        FROM $tabla_reservas r
        INNER JOIN $tabla_asesores a ON r.asesor_id = a.ID
        $where_sql
        ORDER BY r.fecha DESC
        LIMIT %d OFFSET %d
    ";
  $where_params[] = $results_per_page;
  $where_params[] = $offset;

  $sql = $wpdb->prepare($query, ...$where_params);
  $reservas = $wpdb->get_results($sql);

  echo '<div class="wrap">';
  echo '<h1>Reservas de Asesores</h1>';

  // Formulario de búsqueda y filtro por fecha
  echo '<form method="GET" action="" style="text-align: right;margin-bottom: 12px;">';
  echo '<input type="hidden" name="page" value="reservas-asesores">';
  echo '<input type="text" name="busqueda" value="' . esc_attr($busqueda) . '" placeholder="Buscar por nombre de asesor o cliente" style="min-width: 200px;">';
  echo '<input type="date" name="fecha" value="' . esc_attr($fecha_filtro) . '" style="min-width: 150px;">';
  echo '<input type="submit" value="Filtrar" class="button">';
  echo '</form>';

  // Tabla de resultados
  echo '<table class="widefat fixed" cellspacing="0">';
  echo '<thead><tr><th>ID</th><th>Asesor</th><th>Fecha Reservada</th><th>Hora Inicio</th><th>Ubicación</th><th>Nombre Cliente</th><th>Correo Cliente</th><th>Acciones</th></tr></thead>';
  echo '<tbody>';

  foreach ($reservas as $reserva) {
    // Obtener la ubicación del asesor (taxonomía)
    $ubicacion = get_the_terms($reserva->asesor_id, 'ubicacion');
    $ubicacion_nombre = $ubicacion && !is_wp_error($ubicacion) ? esc_html($ubicacion[0]->name) : 'Sin ubicación';

    echo '<tr>';
    echo '<td>' . esc_html($reserva->id) . '</td>';
    echo '<td>' . esc_html($reserva->asesor) . '</td>';
    echo '<td>' . esc_html($reserva->fecha) . '</td>';
    echo '<td>' . esc_html($reserva->hora_inicio) . '</td>';
    echo '<td>' . $ubicacion_nombre . '</td>';
    echo '<td>' . esc_html($reserva->nombre_cliente) . '</td>';
    echo '<td>' . esc_html($reserva->correo_cliente) . '</td>';
    echo '<td><a href="?page=reservas-asesores&eliminar_reserva=' . esc_html($reserva->id) . '" onclick="return confirm(\'¿Estás seguro de que deseas eliminar esta reserva?\');">Eliminar</a></td>';
    echo '</tr>';
  }

  echo '</tbody></table>';

  // Paginación
  echo '<div class="tablenav bottom">';
  echo '<div class="tablenav-pages">';
  echo '<span class="displaying-num">Página ' . $current_page . ' de ' . $total_pages . '</span>';

  echo '<style>#sorsa-pagination-links .page-numbers.current{font-weight: bold;font-size: 14px;}</style>';
  echo '<span class="pagination-links" id="sorsa-pagination-links">';

  if ($current_page > 1) {
    echo '<a style="margin-inline:5px;" class="prev page-numbers" href="?page=reservas-asesores&busqueda=' . esc_attr($busqueda) . '&fecha=' . esc_attr($fecha_filtro) . '&paged=' . ($current_page - 1) . '">« Anterior</a>';
  }

  for ($i = 1; $i <= $total_pages; $i++) {
    echo '<a style="margin-inline:5px;" class="page-numbers' . ($i == $current_page ? ' current' : '') . '" href="?page=reservas-asesores&busqueda=' . esc_attr($busqueda) . '&fecha=' . esc_attr($fecha_filtro) . '&paged=' . $i . '">' . $i . '</a>';
  }

  if ($current_page < $total_pages) {
    echo '<a style="margin-inline:5px;" class="next page-numbers" href="?page=reservas-asesores&busqueda=' . esc_attr($busqueda) . '&fecha=' . esc_attr($fecha_filtro) . '&paged=' . ($current_page + 1) . '">Siguiente »</a>';
  }
  echo '</span>';
  echo '</div>';
  echo '</div>';

  echo '</div>';
}




// ENDPOINT****************************************************************
function verificar_disponibilidad_endpoint()
{
  register_rest_route('asesores/v1', '/disponibilidad', array(
    'methods' => 'GET',
    'callback' => 'verificar_disponibilidad_callback',
    'permission_callback' => '__return_true', // Puedes ajustar los permisos si es necesario
  ));
}
add_action('rest_api_init', 'verificar_disponibilidad_endpoint');

function verificar_disponibilidad_callback(WP_REST_Request $request)
{
  global $wpdb;

  // Obtener los parámetros del request
  $asesor_id = intval($request->get_param('asesor_id'));
  $fecha = sanitize_text_field($request->get_param('fecha'));
  $hora_inicio = sanitize_text_field($request->get_param('hora_inicio'));


  // Validar que los parámetros obligatorios estén presentes
  if (empty($asesor_id) || empty($fecha) || empty($hora_inicio)) {
    return new WP_REST_Response(array('success' => false, 'message' => 'asesor_id, fecha y hora_inicio son obligatorios'), 400);
  }

  // Validar el formato de la fecha (YYYY-MM-DD)
  if (!preg_match('/\d{4}-\d{2}-\d{2}/', $fecha)) {
    return new WP_REST_Response(array('success' => false, 'message' => 'Formato de fecha incorrecto. Use YYYY-MM-DD'), 400);
  }

  // Verificar si el asesor existe en la base de datos (suponiendo que los asesores son posts en WP)
  $asesor_existe = $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(*) FROM {$wpdb->prefix}posts WHERE ID = %d AND post_type = 'asesor' AND post_status = 'publish'",
    $asesor_id
  ));
  if (!$asesor_existe) {
    return new WP_REST_Response(array('success' => false, 'message' => 'El asesor no existe o no está disponible'), 404);
  }


  // Usar la función verificar_disponibilidad para ver si el asesor está disponible
  $disponible = verificar_disponibilidad($asesor_id, $fecha, $hora_inicio, $hora_fin = null); // Puedes ajustar los parámetros según lo que necesites

  // Retornar la respuesta en formato JSON
  if ($disponible) {
    return new WP_REST_Response(array('success' => true), 200);
  } else {
    // return new WP_REST_Response(array('success' => false, 'message' => 'El asesor ya tiene una reserva en esa fecha y hora'), 409);
    return new WP_REST_Response(array('success' => false, 'message' => 'El asesor ya tiene una reserva en esa fecha y hora'), 200);
  }
}

// ENDPOINT****************************************************************
function insertar_reserva_endpoint()
{
  register_rest_route('asesores/v1', '/reservar', array(
    'methods' => 'POST',
    'callback' => 'insertar_reserva_callback',
    'permission_callback' => '__return_true', // Puedes ajustar permisos si es necesario
  ));
}

add_action('rest_api_init', 'insertar_reserva_endpoint');
function insertar_reserva_callback(WP_REST_Request $request)
{
  global $wpdb;

  // Obtener los parámetros enviados en la solicitud POST
  $asesor_id = intval($request->get_param('asesor_id'));
  $fecha = sanitize_text_field($request->get_param('fecha'));
  $hora_inicio = sanitize_text_field($request->get_param('hora_inicio'));
  $hora_fin = sanitize_text_field($request->get_param('hora_fin'));
  $nombre_cliente = sanitize_text_field($request->get_param('nombre_cliente'));
  $correo_cliente = sanitize_email($request->get_param('correo_cliente'));


  // // Verificar la disponibilidad
  // if (!verificar_disponibilidad($asesor_id, $fecha, $hora_inicio, $hora_fin)) {
  //     return new WP_REST_Response(array('success' => false, 'message' => 'El asesor ya está reservado en el horario especificado'), 400);
  // }


  // Validar que los campos obligatorios no estén vacíos
  // if (empty($asesor_id) || empty($fecha) || empty($hora_inicio) || empty($nombre_cliente) || empty($correo_cliente)) {
  if (empty($asesor_id) || empty($fecha) || empty($hora_inicio) || empty($nombre_cliente)) {
    return new WP_REST_Response(array('success' => false, 'message' => 'Datos incompletos'), 400);
  }


  // Convertir la fecha al formato YYYY-MM-DD si es necesario
  if (!preg_match('/\d{4}-\d{2}-\d{2}/', $fecha)) {
    return new WP_REST_Response(array('success' => false, 'message' => 'Formato de fecha incorrecto. Use YYYY-MM-DD'), 400);
  }


  // Verificar si el asesor existe en la base de datos (suponiendo que los asesores son posts en WP)
  $asesor_existe = $wpdb->get_var($wpdb->prepare(
    "SELECT COUNT(*) FROM {$wpdb->prefix}posts WHERE ID = %d AND post_type = 'asesor' AND post_status = 'publish'",
    $asesor_id
  ));
  if (!$asesor_existe) {
    return new WP_REST_Response(array('success' => false, 'message' => 'El asesor no existe o no está disponible'), 404);
  }


  // Verificar que la hora de reserva no sea anterior a la hora actual (en la misma fecha)
  // date_default_timezone_set('America/Lima'); // Ajusta la zona horaria si es necesario
  // $hora_actual = current_time('H:i');  // Hora actual en formato HH:mm
  // $fecha_actual = current_time('Y-m-d');  // Fecha actual
  // // Si la fecha es hoy, validar la hora
  // if ($fecha === $fecha_actual && $hora_inicio < $hora_actual) {
  //     return new WP_REST_Response(array('success' => false, 'message' => 'No puedes reservar en una hora que ya ha pasado'), 409);
  // }


  // Verificar que la fecha de reserva no sea anterior a la fecha actual
  date_default_timezone_set('America/Lima'); // Ajusta la zona horaria si es necesario
  // $fecha_actual = current_time('Y-m-d');  // Fecha actual
  $fecha_actual = date('Y-m-d');  // Fecha actual con la zona horaria correcta
  if ($fecha < $fecha_actual) {
    return new WP_REST_Response(array('success' => false, 'message' => 'No puedes reservar en una fecha anterior a la actual'), 409);
  }
  // Verificar que la hora de reserva no sea anterior a la hora actual (en la misma fecha)
  if ($fecha === $fecha_actual) {
    // $hora_actual = current_time('H:i');  // Hora actual en formato HH:mm
    $hora_actual = date('H:i');  // Hora actual con la zona horaria correcta
    if ($hora_inicio < $hora_actual) {
      return new WP_REST_Response(array('success' => false, 'message' => 'No puedes reservar en una hora que ya ha pasado'), 409);
    }
  }

  // CLIENTE: AHORA SE PUEDEN AGENDAR N reservas a la misma hora
  /*
  // Llamar a la función para verificar disponibilidad
  $disponible = verificar_disponibilidad($asesor_id, $fecha, $hora_inicio, $hora_fin);
  // Si ya existe una reserva, devolver un error
  if (!$disponible) {
    return new WP_REST_Response(array('success' => false, 'message' => 'Ya existe una reserva para este asesor en esta fecha y hora'), 409); // Código 409: conflicto
  }
  */

  // Llamar a la función que inserta la reserva
  // $resultado = insertar_reserva($asesor_id, $fecha, $hora_inicio, $hora_fin);
  $resultado = insertar_reserva($asesor_id, $fecha, $hora_inicio, $hora_fin, $nombre_cliente, $correo_cliente);

  if ($resultado) {
    return new WP_REST_Response(array('success' => true, 'message' => 'Reserva insertada con éxito'), 200);
  } else {
    return new WP_REST_Response(array('success' => false, 'message' => 'Error al insertar la reserva' . ' - ' . print_r($resultado)), 500);
  }
}



// https://chatgpt.com/share/66e84d69-5354-800c-b008-db0cc0672a80