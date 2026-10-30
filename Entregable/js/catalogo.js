// js/catalogo.js

document.addEventListener("DOMContentLoaded", () => {
    const contenedorCarrusel = document.getElementById("contenido-carrusel");

    // Simulamos la obtención de datos desde localStorage (en el futuro se conectará con app.js)
    let inventario = JSON.parse(localStorage.getItem('inventarioData')) || [];

    // Si el inventario está vacío, agregamos datos de prueba para visualizar el carrusel
    if (inventario.length === 0) {
        inventario = [
            { nombre: "Calculadora Científica", sku: "CALC-01", cantidad: 15, precio: 350.00 },
            { nombre: "Cuaderno Profesional", sku: "CUAD-02", cantidad: 50, precio: 45.50 },
            { nombre: "Bata de Laboratorio", sku: "BATA-03", cantidad: 8, precio: 280.00 }
        ];
    }

    // Limpiar contenedor
    contenedorCarrusel.innerHTML = "";

    // Construir cada elemento del carrusel
    inventario.forEach((producto, index) => {
        // La primera diapositiva debe tener la clase 'active' para que el carrusel funcione
        const claseActiva = index === 0 ? "active" : "";

        const diapositiva = document.createElement("div");
        diapositiva.className = `carousel-item ${claseActiva}`;

        // Diseño de la tarjeta dentro del carrusel
        diapositiva.innerHTML = `
            <div class="d-flex justify-content-center p-3">
                <div class="card text-center border-0 w-100 px-5">
                    <div class="card-body">
                        <h3 class="card-title fw-bold">${producto.nombre}</h3>
                        <h5 class="text-muted mb-3">SKU: ${producto.sku}</h5>

                        <div class="d-flex justify-content-center gap-4 my-4">
                            <div>
                                <p class="mb-0 text-muted">Stock Disponible</p>
                                <span class="fs-3 fw-bold">${producto.cantidad}</span> <small>uds</small>
                            </div>
                            <div>
                                <p class="mb-0 text-muted">Precio Unitario</p>
                                <span class="fs-3 fw-bold" style="color: var(--ipn-guinda);">$${parseFloat(producto.precio).toFixed(2)}</span>
                            </div>
                        </div>

                        <span class="badge ${producto.cantidad > 10 ? 'bg-success' : 'bg-danger'} p-2">
                            ${producto.cantidad > 10 ? 'Stock Óptimo' : 'Stock Bajo'}
                        </span>
                    </div>
                </div>
            </div>
        `;

        contenedorCarrusel.appendChild(diapositiva);
    });
});
