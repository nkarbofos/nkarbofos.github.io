import "../sass/style.scss";
document.addEventListener('DOMContentLoaded', () => {
	const footerForm = document.querySelector('.footer__form');
	if (footerForm) {
		footerForm.addEventListener('submit', (e) => {
			e.preventDefault();

			const emailInput = footerForm.querySelector('.footer__input');
			if (emailInput.validity.valid) {
				alert('Thank you for subscribing!');
				footerForm.reset();
			}
		});
	}
});