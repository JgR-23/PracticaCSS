(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault()   // evita que el formulario recargue la página

      if (!form.checkValidity()) {
        event.stopPropagation()
        form.classList.add('was-validated')
        return
      }

      // Todo es válido: redirige
      window.location.href = '../administrador/administrador.html'
    }, false)
  })
})()