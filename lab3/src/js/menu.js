document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuSidebar = document.querySelector('.menu-sidebar');
  const menuClose = document.querySelector('.menu-close');

  burger.addEventListener('click', function () {
    menuOverlay.classList.add('active');
    menuSidebar.classList.add('active');
  });

  menuClose.addEventListener('click', function () {
    menuOverlay.classList.remove('active');
    menuSidebar.classList.remove('active');
  });

  menuOverlay.addEventListener('click', function (e) {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove('active');
      menuSidebar.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      menuOverlay.classList.remove('active');
      menuSidebar.classList.remove('active');
    }
  });
});
