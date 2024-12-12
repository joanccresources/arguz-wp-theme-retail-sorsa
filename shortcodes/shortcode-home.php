<?php
function shortcode_home_portafolio($atts)
{
  ob_start();


  echo "Hola mundo";

  return ob_get_clean();
}

add_shortcode('home_portafolio', 'shortcode_home_portafolio');


function shortcode_home_galeria($atts)
{
  // Iniciar el buffer de salida
  ob_start();

  // Obtener los términos de la taxonomía "tipo_de_producto"
  // Obtener los términos de la taxonomía "tipo_de_producto" ordenados por el campo "posicion"
  $terms = get_terms(array(
    'taxonomy' => 'tipo_de_producto',
    'hide_empty' => false,
    'meta_key' => 'posicion',
    'orderby' => 'meta_value_num',
    'order' => 'ASC',
  ));

  if (is_wp_error($terms) || empty($terms)) {
    echo '<p>No hay productos disponibles.</p>';
    return ob_get_clean(); // Retornar el contenido del buffer
  }

  echo '<div><div class="row"><div class="col-12">';
  echo '<div class="swiper-home">';
  echo '  <div class="swiper-wrapper">';

  foreach ($terms as $term) {
    $imagen_para_el_home_url = "";
    $imagen_principal_url = "";

    $imagen_para_el_home_id = get_term_meta($term->term_id, 'imagen_para_el_home', true);
    $imagen_principal_id = get_term_meta($term->term_id, 'imagen_principal', true);
    $enlace = get_term_meta($term->term_id, 'enlace', true);

    $target = $enlace !== "#0" ? '_blank' : '_self';

    if ($imagen_para_el_home_id)
      $imagen_para_el_home_url = wp_get_attachment_url($imagen_para_el_home_id);
    if ($imagen_principal_id)
      $imagen_principal_url = wp_get_attachment_url($imagen_principal_id);

    $imagen_a_mostrar_url = $imagen_para_el_home_url;

    echo '    <div class="swiper-slide">';
    echo '      <div class="card-productos">';
    echo '        <div class="card-productos__figure">';
    echo '          <img decoding="async" src="' . esc_url($imagen_a_mostrar_url) . '" alt="' . esc_attr($term->name) . '" class="card-productos__img"/>';
    echo '        </div>';
    echo '        <div class="card-productos__footer">';
    echo '          <a href="' . esc_url($enlace) . '" target="' . $target . '" class="card-productos__btn">' . esc_html($term->name) . '</a>';
    echo '        </div>';
    echo '      </div>';
    echo '    </div>';
  }
  echo '  </div>';

  echo '  <!-- If we need navigation buttons -->';
  echo '  <div class="swiper-button-prev-home">';
  echo '    <img src="' . get_stylesheet_directory_uri() . '/assets/img/arrow-left.png" alt="Previous" />';
  echo '  </div>';

  echo '  <div class="swiper-button-next-home">';
  echo '    <img src="' . get_stylesheet_directory_uri() . '/assets/img/arrow-right.png" alt="Next" />';
  echo '  </div>';

  echo '</div>';

  echo '</div></div></div>';

  // Style
  echo "
  <style>    
    .e-con-inner:has(.swiper-home){
      overflow: hidden;
    }
    .swiper-home [class*='swiper-button-']{
      position: absolute;
      z-index: 9;
      top: 50%;
      transform: translateY(-50%);
      width: 52px;
    }
    .swiper-home .swiper-button-prev-home{
      left: 0;
    }
    .swiper-home .swiper-button-next-home{
      right: 0;
    }
    @media(min-width: 768px){
      width: 62px;
    }
    @media(min-width: 992px){
    }
    @media(min-width: 1200px){
      .swiper-home .swiper-button-prev-home{
        left: -30px;
      }
      .swiper-home .swiper-button-next-home{
        right: -30px;
      }
    }
    @media(min-width: 1400px){
      .swiper-home [class*='swiper-button-']{
        width: auto;
      }
    }
    

    .card-productos{
      background-color: #fff;
      height: 418px;
      padding-top: 30px;
      padding-inline: 30px;
      box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
    }
    .card-productos__figure{
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-productos__img{      
      width: auto;
      object-fit: cover;
    }
    .card-productos__footer{
      text-align: center;
      margin-top: 20px;
    }
    .card-productos__btn{
      display: inline-flex !important; 
      align-items: center;
      justify-content: center;
      min-width: 200px;
      border: 1px solid #004E93;
      padding-block: 4px;
      border-radius: 20px;
      font-size: 20px;
      font-weight: bold;
      color: #606060;
      transition: all 0.5s;
    }
    .card-productos__btn:hover{
      color: #606060;
      opacity: .9;
    }
    @media(min-width: 992px){
    }      
    @media(min-width: 1200px){
      .swiper-slide-next .card-productos{
        box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15);
      }    
    }
    @media(min-width: 1400px){      
    }

  </style>
  ";

  // Script
  echo "
  <script>
    (()=> {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded');
        const swiper = new Swiper('.swiper-home', {
          // autoplay: {
          //   delay: 2000,
          // },
          loop: true,
          slidesPerView: 3, // 3 slides por defecto
          spaceBetween: 30,

          // Navigation arrows
          navigation: {
            nextEl: '.swiper-button-next-home',
            prevEl: '.swiper-button-prev-home',
          },

          breakpoints: {
            0: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            1200: {
              slidesPerView: 3,
            },
          },

        });
      });
    })();
  </script>";

  // Retornar el contenido del buffer y limpiarlo
  return ob_get_clean();
}
add_shortcode('home_galeria', 'shortcode_home_galeria');
