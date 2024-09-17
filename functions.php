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
function insertar_reserva($asesor_id, $fecha, $hora_inicio, $hora_fin)
{
    global $wpdb;

    $tabla_reservas = $wpdb->prefix . 'reservas'; // Nombre de tu tabla de reservas

    $resultado = $wpdb->insert(
        $tabla_reservas,
        array(
            'asesor_id'   => $asesor_id,
            'fecha'       => $fecha,
            'hora_inicio' => $hora_inicio,
            'hora_fin'    => !empty($hora_fin) ? $hora_fin : null, // Inserta null si hora_fin está vacío
            // 'hora_fin'    => $hora_fin
        ),
        array('%d', '%s', '%s', '%s')  // Formatos: %d para números, %s para strings
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

    // Consulta para obtener todas las reservas
    $reservas = $wpdb->get_results("
        SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, a.post_title AS asesor
        FROM $tabla_reservas r
        INNER JOIN $tabla_asesores a ON r.asesor_id = a.ID
        ORDER BY r.fecha DESC
    ");

    echo '<div class="wrap">';
    echo '<h1>Reservas de Asesores</h1>';
    echo '<table class="widefat fixed" cellspacing="0">';
    echo '<thead><tr><th>ID</th><th>Asesor</th><th>Fecha</th><th>Hora Inicio</th><th>Hora Fin</th></tr></thead>';
    echo '<tbody>';

    foreach ($reservas as $reserva) {
        echo '<tr>';
        echo '<td>' . esc_html($reserva->id) . '</td>';
        echo '<td>' . esc_html($reserva->asesor) . '</td>';
        echo '<td>' . esc_html($reserva->fecha) . '</td>';
        echo '<td>' . esc_html($reserva->hora_inicio) . '</td>';
        echo '<td>' . esc_html($reserva->hora_fin) . '</td>';
        echo '</tr>';
    }

    echo '</tbody></table></div>';
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

    // Usar la función verificar_disponibilidad para ver si el asesor está disponible
    $disponible = verificar_disponibilidad($asesor_id, $fecha, $hora_inicio, $hora_fin = null); // Puedes ajustar los parámetros según lo que necesites

    // Retornar la respuesta en formato JSON
    if ($disponible) {
        return new WP_REST_Response(array('disponible' => true), 200);
    } else {
        return new WP_REST_Response(array('disponible' => false), 200);
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
    // Obtener los parámetros enviados en la solicitud POST
    $asesor_id = intval($request->get_param('asesor_id'));
    $fecha = sanitize_text_field($request->get_param('fecha'));
    $hora_inicio = sanitize_text_field($request->get_param('hora_inicio'));
    $hora_fin = sanitize_text_field($request->get_param('hora_fin'));


    // Validar que los campos obligatorios no estén vacíos
    if (empty($asesor_id) || empty($fecha) || empty($hora_inicio)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Datos incompletos'), 400);
    }

    // Convertir la fecha al formato YYYY-MM-DD si es necesario
    if (!preg_match('/\d{4}-\d{2}-\d{2}/', $fecha)) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Formato de fecha incorrecto. Use YYYY-MM-DD'), 400);
    }

    // Llamar a la función para verificar disponibilidad
    $disponible = verificar_disponibilidad($asesor_id, $fecha, $hora_inicio, $hora_fin);    
    // Si ya existe una reserva, devolver un error
    if (!$disponible) {
        return new WP_REST_Response(array('success' => false, 'message' => 'Ya existe una reserva para este asesor en esta fecha y hora'), 409); // Código 409: conflicto
    }

    // Llamar a la función que inserta la reserva
    $resultado = insertar_reserva($asesor_id, $fecha, $hora_inicio, $hora_fin);

    if ($resultado) {
        return new WP_REST_Response(array('success' => true, 'message' => 'Reserva insertada con éxito'), 200);
    } else {
        return new WP_REST_Response(array('success' => false, 'message' => 'Error al insertar la reserva' . ' - ' .  print_r($resultado)), 500);
    }
}



// https://chatgpt.com/share/66e84d69-5354-800c-b008-db0cc0672a80