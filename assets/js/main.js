const addClassStickyHeaderHome = () => {
  const $header = document.querySelector(".home header");
  if (!$header) return;
  console.log("window.scrollY", window.scrollY);
  if (window.scrollY >= 78) {
    $header.classList.add("v-sticky");
    const $img = $header.querySelector(".logo-pc img");
    console.log("if $img", $img);
    if (!$img) return;
    $img.setAttribute(
      "src",
      "https://corporativa.sorsa.pe/wp-content/uploads/2024/03/logo-footer.png"
    );
  } else {
    $header.classList.remove("v-sticky");
    const $img = $header.querySelector(".logo-pc img");
    console.log("else $img", $img);
    if (!$img) return;
    $img.setAttribute(
      "src",
      "https://corporativa.sorsa.pe/wp-content/uploads/2024/08/logo.png"
    );
  }
};

addEventListener("DOMContentLoaded", () => {
  const $rrssMenu = document.querySelector("#menu-main .menu-rrss");
  const $listMenu = document.querySelector("#menu-menu-sorsa");
  $listMenu?.insertAdjacentHTML("afterend", $rrssMenu.innerHTML);
});
window.addEventListener("DOMContentLoaded", addClassStickyHeaderHome);
document.addEventListener("scroll", addClassStickyHeaderHome);

// const desabilitarLinks = () => {
//   // Links desabilitados
//   Array.from(
//     document.querySelectorAll("#home .home-portafolio .col-lg-8 a")
//   ).forEach((a) => {
//     a.setAttribute("href", "#0");
//   });
// };
// addEventListener("DOMContentLoaded", () => {
//   desabilitarLinks();
// });
