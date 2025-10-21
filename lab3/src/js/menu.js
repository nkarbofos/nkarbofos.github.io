document.addEventListener('DOMContentLoaded', function () {
  const burger = document.querySelector('.burger');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuSidebar = document.querySelector('.menu-sidebar');
  const menuClose = document.querySelector('.menu-close');

  // Открыть меню
  burger.addEventListener('click', function () {
    menuOverlay.classList.add('active');
    menuSidebar.classList.add('active');
  });

  // Закрыть меню по клику на крестик
  menuClose.addEventListener('click', function () {
    menuOverlay.classList.remove('active');
    menuSidebar.classList.remove('active');
  });

  // Закрыть меню по клику на затемнение
  menuOverlay.addEventListener('click', function (e) {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove('active');
      menuSidebar.classList.remove('active');
    }
  });

  // Закрыть меню при нажатии клавиши Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      menuOverlay.classList.remove('active');
      menuSidebar.classList.remove('active');
    }
  });
});
