// contact-form.js

class ContactForm extends HTMLElement {
  constructor() {
    super();

    // Create a shadow DOM for encapsulation (optional but recommended)
    const shadow = this.attachShadow({ mode: 'open' });

    // Template
    const template = document.createElement('template');
    template.innerHTML = `
      <link rel="stylesheet" href="src/sass/style.css">
      <section class="form">
        <h2 class="title-h2-bold form__title">Get in touch</h2>
        <div class="form__view">
          <img src="../img/form/tea.jpg" alt="tea" class="img-shadow form__view__img" />
          <div class="form__view__fields">
            <div class="form__view__fields__name">
              <label for="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Name" />
            </div>
            <div class="form__view__fields__email">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Email" />
            </div>
            <div class="form__view__fields__question">
              <label for="question">Your question</label>
              <textarea id="question" name="question" placeholder="Question"></textarea>
            </div>
            <div class="form__view__fields__agree">
              <input type="checkbox" id="agree" name="agree" checked />
              <label for="agree">I agree with the terms</label>
            </div>
            <button class="btn-default form__view__fields__btn">send request</button>
            <div class="form__view__fields__vase">
              <img src="../img/form/vase.png" alt="vase" />
            </div>
          </div>
        </div>
      </section>
    `;

    shadow.appendChild(template.content.cloneNode(true));

    // Add event listener to the button
    const button = shadow.querySelector('.form__view__fields__btn');
    button.addEventListener('click', () => {
      this.handleSubmit();
    });
  }

  // Method to get current form values
  getFormData() {
    const shadow = this.shadowRoot;
    return {
      name: shadow.getElementById('name').value,
      email: shadow.getElementById('email').value,
      question: shadow.getElementById('question').value,
      agree: shadow.getElementById('agree').checked,
    };
  }

  // Handle form submission (you can customize this)
  handleSubmit() {
    const shadow = this.shadowRoot;
    const nameInput = shadow.getElementById('name');
    const emailInput = shadow.getElementById('email');
    const questionTextarea = shadow.getElementById('question');
    const agreeCheckbox = shadow.getElementById('agree');

    // Reset previous errors
    [nameInput, emailInput, questionTextarea].forEach(el => {
        el.classList.remove('invalid');
    });

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
        nameInput.classList.add('invalid');
        isValid = false;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
        emailInput.classList.add('invalid');
        isValid = false;
    }

    // Validate Question
    if (!questionTextarea.value.trim()) {
        questionTextarea.classList.add('invalid');
        isValid = false;
    }

    // Validate Agreement (optional: if required)
    // Validate Agreement
    const agreeContainer = shadow.querySelector('.form__view__fields__agree');
    agreeContainer.classList.remove('invalid'); // reset

    if (!agreeCheckbox.checked) {
        agreeContainer.classList.add('invalid');
        isValid = false;
    } else {
        agreeContainer.classList.remove('invalid');
    }

    if (!isValid) {
        console.log('Form has errors. Please fix highlighted fields.');
        return;
    }

    // Form is valid → collect data
    const data = this.getFormData();
    console.log('Form submitted:', data);

    // Emit event
    this.dispatchEvent(
        new CustomEvent('formSubmit', {
        detail: data,
        bubbles: true,
        composed: true,
        })
    );
    }
}

// Register the custom element
customElements.define('contact-form', ContactForm);