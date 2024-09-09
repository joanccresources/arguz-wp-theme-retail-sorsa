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
    wp_enqueue_style('artech-parent-style', get_template_directory_uri() . '/style.css', array('bootstrap'));
    wp_enqueue_style('artech-child-style', get_stylesheet_uri(), array('artech-parent-style'));
}



require_once get_stylesheet_directory() . '/shortcodes/shortcode-home.php';
