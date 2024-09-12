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

// 
require_once get_stylesheet_directory() . '/helpers/agenda/talleres.php';