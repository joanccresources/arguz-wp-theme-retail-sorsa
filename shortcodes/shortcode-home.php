<?php
function shortcode_home_portafolio($atts)
{
  ob_start();


  echo "Hola mundo";

  return ob_get_clean();
}

add_shortcode('home_portafolio', 'shortcode_home_portafolio');
