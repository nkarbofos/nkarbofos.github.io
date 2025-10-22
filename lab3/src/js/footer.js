(function () {
  function createFooterHTML() {
    return `
      <link rel="stylesheet" href="./src/sass/style.css">
      #####################################################################################
      <footer class="footer">
        <div class="container">
          <div class="footer__columns">
            <div class="footer__column">
              <h4 class="footer__title">NEWSLETTER</h4>
              <p class="footer__text">Keep up to date with news and promotions</p>
              <form class="footer__form">
                <input type="email" placeholder="Enter your e-mail" class="footer__input" required>
                <label class="footer__checkbox">
                  <input type="checkbox" name="terms">
                  <span>I agree with the <a href="#" class="footer__link">terms</a></span>
                </label>
                <button type="submit" class="footer__btn">SUBMIT</button>
              </form>
            </div>

            <div class="footer__column">
              <h4 class="footer__title">DISCOVER</h4>
              <ul class="footer__list">
                <li><a href="about.html" class="footer__link">About Us</a></li>
                <li><a href="blog.html" class="footer__link">Blog</a></li>
              </ul>
            </div>

            <div class="footer__column">
              <h4 class="footer__title">SHOPPING</h4>
              <ul class="footer__list">
                <li><a href="catalog.html" class="footer__link">Catalog</a></li>
              </ul>
            </div>

            <div class="footer__column">
              <h4 class="footer__title">INFORMATION</h4>
              <ul class="footer__list">
                <li><a href="#" class="footer__link">Terms and Conditions</a></li>
              </ul>
            </div>
            
            <div class="footer__column">
              <h4 class="footer__title">FOLLOW US</h4>
              <div class="footer__social">
                <a href="#" class="footer__social-icon"><span class="icon-facebook"></span></a>
                <a href="#" class="footer__social-icon"><span class="icon-instagram"></span></a>
                <a href="#" class="footer__social-icon"><span class="icon-pinterest"></span></a>
              </div>
            </div>
          </div>

          <div class="footer__copyright">
            © Copyright 2025, Ceramic soul
          </div>
        </div>
      </footer>
    `;
  }

  function injectFooter() {
    const footer = document.createElement('div');
    footer.innerHTML = createFooterHTML().trim();
    document.body.appendChild(footer.firstElementChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
