<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<link rel="profile" href="//gmpg.org/xfn/11" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
	<link rel="stylesheet" href="<?= get_stylesheet_directory_uri() ?>/assets/css/main.css?v=<?= time() ?>">
	<!-- Todos las entradas -->
	<?php if (is_single() && 'post' === get_post_type()): ?>
		<link rel="stylesheet" href="<?= get_stylesheet_directory_uri() ?>/assets/css/blog.css?v=<?= time() ?>">
	<?php endif; ?>
	<!-- Todos las categorias -->
	<?php if (is_category()): ?>
		<link rel="stylesheet" href="<?= get_stylesheet_directory_uri() ?>/assets/css/blog-category.css?v=<?= time() ?>">
	<?php endif; ?>
</head>

<body <?php body_class(); ?>>
	<?php
	wp_body_open();

	/*================================================ 
## HEADER
==================================================*/

	/*-- Custom header --*/
	if (class_exists('\ThemescampPlugin\ThemescampPlugin')) {

		do_action("themescamp_head_builder");
	} else {


	?>
		<!--Default header Fallback if no options install-->
		<div class="default-header clearfix tcg-theme">
			<nav class="header apply-header not-custom-menu clearfix white-header shadow-header .">
				<div class="nav-box">
					<div class="stuck-nav">
						<div class="container-fluid">
							<div class="top-logo">
								<p class="site-title"><a href='<?php echo esc_url(home_url('/')); ?>' rel="home"><?php bloginfo('name'); ?></a></p>
							</div>
							<div class="header-wrapper d-none d-md-block"> <!-- hidden-xs hidden-sm -->
								<div class="main-menu menu-wrapper">
									<?php artech_custom_menu_page('tcg_header_menu');  ?>
								</div>
							</div><!-- header-wrapper -->

							<div class="mobile-wrapper d-block d-md-none "> <!-- hidden-lg hidden-md -->
								<a href="#" class="hamburger">
									<div class="hamburger__icon"></div>
								</a>
								<div class="fat-nav">
									<div class="fat-nav__wrapper">
										<div class="fat-list">
											<?php artech_custom_flat_menu_page('tcg_header_menu'); ?>
										</div>
									</div>
								</div>
							</div><!-- End mobile-wrapper -->

						</div><!-- container-fluid -->
					</div><!-- stuck-nav -->
				</div><!-- nav-box -->
			</nav><!-- header -->
		</div>
	<?php
	}
