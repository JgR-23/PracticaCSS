// js/validaciones.js

document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("form-producto");
    const contenedorErrores = document.getElementById("mensajes-error");
    const contenedorResultado = document.getElementById("resultado-registro");
    const textoDatosIngresados = document.getElementById("datos-ingresados");

    formulario.addEventListener("submit", function(evento) {
        // Evitar que la página se recargue al enviar el formulario
        evento.preventDefault();

        // Limpiar estados previos
        contenedorErrores.classList.add("d-none");
        contenedorErrores.innerHTML = "";
        contenedorResultado.classList.add("d-none");

        // Obtener valores de los campos
        const nombre = document.getElementById("nombre").value.trim();
        const sku = document.getElementById("sku").value.trim();
        const cantidad = document.getElementById("cantidad").value.trim();
        const precio = document.getElementById("precio").value.trim();

        let errores = [];

        // Validaciones de campos obligatorios
        if (nombre === "") {
            errores.push("El campo 'Nombre del Producto' es obligatorio.");
        }
        if (sku === "") {
            errores.push("El campo 'Código SKU' es obligatorio.");
        }
        if (cantidad === "" || isNaN(cantidad) || Number(cantidad) <= 0) {
            errores.push("Ingresa una 'Cantidad' válida mayor a 0.");
        }
        if (precio === "" || isNaN(precio) || Number(precio) <= 0) {
            errores.push("Ingresa un 'Precio' válido mayor a 0.");
        }

        // Mostrar errores si existen
        if (errores.length > 0) {
            const listaErrores = document.createElement("ul");
            listaErrores.className = "mb-0";
            errores.forEach(error => {
                const li = document.createElement("li");
                li.textContent = error;
                listaErrores.appendChild(li);
            });
            contenedorErrores.appendChild(listaErrores);
            contenedorErrores.classList.remove("d-none");
            return; // Detener la ejecución si hay errores
        }

        // Si no hay errores, mostrar los datos ingresados en pantalla
        textoDatosIngresados.innerHTML = `
            <strong>Nombre:</strong> ${nombre} <br>
            <strong>SKU:</strong> ${sku} <br>
            <strong>Cantidad:</strong> ${cantidad} unidades <br>
            <strong>Precio:</strong> $${parseFloat(precio).toFixed(2)}
        `;
        contenedorResultado.classList.remove("d-none");

        // Aquí iría la lógica futura para guardar en localStorage (app.js)

        // Limpiar el formulario
        formulario.reset();
    });
});
