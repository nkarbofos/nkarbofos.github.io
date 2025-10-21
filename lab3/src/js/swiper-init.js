// js/swiper-init.js
document.addEventListener('DOMContentLoaded', function () {
  const swiper = new Swiper('.swiper', {
    // Display 3 slides at once
    slidesPerView: 3,

    // Space between slides (in px)
    spaceBetween: 10,

    // Enable centered slides (optional, if you want active slide in center)
    centeredSlides: true,

    // Enable loop mode (optional, if you want infinite scrolling)
    loop: true,

    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    // Pagination dots
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      type: 'bullets', // Default, but explicit for clarity
    },

    // Optional: Smooth transition speed
    speed: 600,
  });
});