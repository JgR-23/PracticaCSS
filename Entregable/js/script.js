// Estado de la aplicación
let inventory = [];

// Elementos del DOM
const form = document.getElementById('inventory-form');
const tableBody = document.getElementById('inventory-body');
const totalItemsEl = document.getElementById('total-items');
const totalValueEl = document.getElementById('total-value');

// Escuchar el evento de agregar producto
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Obtener valores del formulario
    const name = document.getElementById('name').value;
    const sku = document.getElementById('sku').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);

    // Crear objeto de producto
    const product = {
        id: Date.now(), // Generar un ID único basado en el tiempo
        name,
        sku,
        quantity,
        price
    };

    // Agregar al estado y actualizar la vista
    inventory.push(product);
    form.reset();
    updateUI();
});

// Función para actualizar la tabla y los contadores
function updateUI() {
    // Limpiar tabla actual
    tableBody.innerHTML = '';

    let totalItems = 0;
    let totalValue = 0;

    // Recorrer el inventario e inyectar filas HTML
    inventory.forEach(item => {
        totalItems += item.quantity;
        totalValue += (item.quantity * item.price);

        const row = document.createElement('tr');

        // Evaluar si el stock es bajo para darle estilo
        const stockClass = item.quantity < 10 ? 'low-stock' : '';

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.sku}</td>
            <td class="${stockClass}">${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.quantity * item.price).toFixed(2)}</td>
            <td>
                <button class="action-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="action-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <button class="action-btn btn-delete" onclick="deleteProduct(${item.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Actualizar dashboard
    totalItemsEl.textContent = totalItems;
    totalValueEl.textContent = totalValue.toFixed(2);
}

// Función para sumar o restar stock directamente en la tabla
function updateQuantity(id, change) {
    const product = inventory.find(p => p.id === id);
    if (product) {
        const newQuantity = product.quantity + change;
        // Evitar que el stock sea negativo
        if (newQuantity >= 0) {
            product.quantity = newQuantity;
            updateUI();
        }
    }
}

// Función para eliminar un producto completo
function deleteProduct(id) {
    inventory = inventory.filter(p => p.id !== id);
    updateUI();
}
