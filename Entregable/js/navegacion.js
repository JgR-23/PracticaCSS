// js/navegacion.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener la ruta de la página actual (ej. "/catalogo.html" o simplemente "catalogo.html")
    const rutaActual = window.location.pathname.split("/").pop();

    // 2. Seleccionar todos los enlaces de la barra de navegación
    const enlacesNavegacion = document.querySelectorAll(".navbar-nav .nav-link");

    // 3. Recorrer cada enlace para verificar si coincide con la página actual
    enlacesNavegacion.forEach(enlace => {
        // Obtenemos el nombre del archivo al que apunta el enlace
        const href = enlace.getAttribute("href");

        // Removemos la clase 'active' por defecto
        enlace.classList.remove("active");

        // Si la ruta actual coincide con el href, o si es la raíz y el enlace es index.html
        if (rutaActual === href || (rutaActual === "" && href === "index.html")) {
            enlace.classList.add("active");

            // Opcional: Para accesibilidad, indicamos que es la página actual
            enlace.setAttribute("aria-current", "page");
        }
    });
});
