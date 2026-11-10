'use strict';

const KEY_PRODUCTOS = 'ipn_productos';
const KEY_OFERTAS = 'ipn_ofertas';
const MAX_IMAGEN_BYTES = 2 * 1024 * 1024;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png'];
const moneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const $ = (id) => document.getElementById(id);

function leer(clave) {
  try { return JSON.parse(localStorage.getItem(clave)) || []; }
  catch { return []; }
}

function guardar(clave, datos) {
  try { localStorage.setItem(clave, JSON.stringify(datos)); return true; }
  catch { return false; }
}

const reglas = {
  codigo(v) {
    if (!v) return 'El código es obligatorio.';
    if (!/^[A-Za-z0-9-]{3,12}$/.test(v)) {
      return 'Usa de 3 a 12 caracteres: letras, números o guion, sin espacios.';
    }
    const repetido = leer(KEY_PRODUCTOS).some((p) => p.codigo.toLowerCase() === v.toLowerCase());
    return repetido ? 'Ya existe un producto con ese código.' : '';
  },

  nombre(v) {
    if (!v) return 'El nombre es obligatorio.';
    if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    return '';
  },

  categoria(v) {
    return v ? '' : 'Selecciona una categoría.';
  },

  precio(v) {
    if (v === '') return 'El precio es obligatorio.';
    if (Number(v) < 0) return 'El precio no puede ser negativo.';
    if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Escribe un precio con máximo 2 decimales.';
    if (Number(v) === 0) return 'El precio debe ser mayor que 0.';
    if (Number(v) > 100000) return 'El precio no puede superar $100,000.';
    return '';
  },

  existencia(v) {
    if (v === '') return 'La existencia es obligatoria.';
    if (Number(v) < 0) return 'La existencia no puede ser negativa.';
    if (!/^\d+$/.test(v)) return 'Escribe un número entero (sin decimales).';
    if (Number(v) > 100000) return 'La existencia no puede superar 100,000 piezas.';
    return '';
  },

  descripcion(v) {
    if (!v) return 'La descripción es obligatoria.';
    if (v.length < 10) return `Escribe al menos 10 caracteres (llevas ${v.length}).`;
    return '';
  },

  imagen(archivo) {
    if (!archivo) return 'Selecciona una imagen del producto.';
    if (!TIPOS_IMAGEN.includes(archivo.type)) return 'Formato no válido. Usa JPG, PNG o WebP.';
    if (archivo.size > MAX_IMAGEN_BYTES) return 'La imagen pesa más de 2 MB. Elige una más ligera.';
    return '';
  },

  producto(v) {
    if (leer(KEY_PRODUCTOS).length === 0) return 'Primero registra un producto en el formulario 1.';
    return v ? '' : 'Selecciona un producto.';
  },

  descuento(v) {
    if (v === '') return 'El descuento es obligatorio.';
    if (!/^\d+$/.test(v)) return 'Escribe un número entero, sin decimales ni signos.';
    const n = Number(v);
    if (n < 1 || n > 90) return 'El descuento debe estar entre 1% y 90%.';
    return '';
  },
};

function mostrarError(campo, mensaje) {
  $(`${campo.id}-error`).textContent = mensaje;
  campo.classList.toggle('invalido', mensaje !== '');
  campo.classList.toggle('valido', mensaje === '');
  campo.setAttribute('aria-invalid', String(mensaje !== ''));
}

function limpiarCampo(campo) {
  $(`${campo.id}-error`).textContent = '';
  campo.classList.remove('invalido', 'valido');
  campo.removeAttribute('aria-invalid');
  delete campo.dataset.tocado;
}

function validar(campo) {
  let mensaje;
  if (campo.validity && campo.validity.badInput) {
    mensaje = 'Escribe un número válido.';
  } else {
    const valor = campo.type === 'file' ? campo.files[0] : campo.value.trim();
    mensaje = reglas[campo.name](valor);
  }
  mostrarError(campo, mensaje);
  return mensaje === '';
}

function conectar(campos) {
  campos.forEach((campo) => {
    const alCambiar = campo.tagName === 'SELECT' || campo.type === 'file';
    campo.addEventListener(alCambiar ? 'change' : 'input', () => {
      if (alCambiar || campo.dataset.tocado) validar(campo);
    });
    campo.addEventListener('blur', () => {
      campo.dataset.tocado = '1';
      validar(campo);
    });
  });
}

function mostrarResumen(caja, texto) {
  caja.textContent = texto;
  caja.hidden = texto === '';
}

function resumenDeInvalidos(invalidos) {
  if (!invalidos.length) return '';
  const nombres = invalidos.map((c) => document.querySelector(`label[for="${c.id}"]`).textContent);
  return `Revisa ${invalidos.length === 1 ? 'el campo' : 'los campos'}: ${nombres.join(', ')}.`;
}

function calcularPrecioOferta(precio, descuento) {
  return Math.round(precio * (100 - descuento)) / 100;
}

/* Muestra en pantalla lo que se acaba de registrar */
function mostrarResultado(contenedor, titulo, imagen, nombreProducto, filas) {
  const h3 = document.createElement('h3');
  h3.textContent = titulo;

  const img = new Image();
  img.src = imagen;
  img.alt = `Imagen de ${nombreProducto}`;

  const lista = document.createElement('dl');
  filas.forEach(([etiqueta, valor]) => {
    const dt = document.createElement('dt');
    dt.textContent = etiqueta;
    const dd = document.createElement('dd');
    dd.textContent = valor;
    lista.append(dt, dd);
  });

  contenedor.replaceChildren(h3, img, lista);
  contenedor.hidden = false;
}

function comprimirImagen(archivo, ladoMax = 600) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('El archivo no es una imagen válida.'));
    };
    img.src = url;
  });
}


const formProducto = $('form-producto');
const camposProducto = ['codigo', 'nombre', 'categoria', 'precio', 'existencia', 'descripcion', 'imagen'].map($);
const descripcion = $('descripcion');
const contador = $('contador');
const vistaPrevia = $('vista-previa');
let urlPrevia = null;

conectar(camposProducto);

descripcion.addEventListener('input', () => {
  contador.textContent = `${descripcion.value.length}/${descripcion.maxLength}`;
});

function limpiarVistaPrevia() {
  if (urlPrevia) URL.revokeObjectURL(urlPrevia);
  urlPrevia = null;
  vistaPrevia.removeAttribute('src');
  vistaPrevia.hidden = true;
}

$('imagen').addEventListener('change', (e) => {
  limpiarVistaPrevia();
  const archivo = e.target.files[0];
  if (archivo && !e.target.classList.contains('invalido')) {
    urlPrevia = URL.createObjectURL(archivo);
    vistaPrevia.src = urlPrevia;
    vistaPrevia.hidden = false;
  }
});
vistaPrevia.addEventListener('error', () => {
  limpiarVistaPrevia();
  mostrarError($('imagen'), 'El archivo no es una imagen válida.');
});

formProducto.addEventListener('submit', async (e) => {
  e.preventDefault();
  const resumen = $('resumen-producto');

  const invalidos = camposProducto.filter((c) => !validar(c));
  mostrarResumen(resumen, resumenDeInvalidos(invalidos));
  if (invalidos.length) {
    invalidos[0].focus();
    return;
  }

  const boton = formProducto.querySelector('button[type="submit"]');
  boton.disabled = true;
  try {
    const producto = {
      codigo: $('codigo').value.trim(),
      nombre: $('nombre').value.trim(),
      categoria: $('categoria').value,
      precio: Number($('precio').value),
      existencia: Number($('existencia').value),
      descripcion: descripcion.value.trim(),
      imagen: await comprimirImagen($('imagen').files[0]),
    };

    const productos = leer(KEY_PRODUCTOS);
    productos.push(producto);
    if (!guardar(KEY_PRODUCTOS, productos)) {
      throw new Error('No hay espacio de almacenamiento en el navegador.');
    }

    mostrarResultado($('resultado-producto'), 'Producto registrado', producto.imagen, producto.nombre, [
      ['Código', producto.codigo],
      ['Nombre', producto.nombre],
      ['Categoría', producto.categoria],
      ['Precio', moneda.format(producto.precio)],
      ['Existencia', `${producto.existencia} pzas.`],
      ['Descripción', producto.descripcion],
    ]);

    formProducto.reset();
    llenarSelectProductos();
  } catch (err) {
    mostrarResumen(resumen, `No se pudo guardar el producto. ${err.message}`);
  } finally {
    boton.disabled = false;
  }
});

formProducto.addEventListener('reset', () => {
  // El reset del navegador ocurre después de este evento; limpiamos en el siguiente ciclo.
  setTimeout(() => {
    camposProducto.forEach(limpiarCampo);
    contador.textContent = `0/${descripcion.maxLength}`;
    limpiarVistaPrevia();
    mostrarResumen($('resumen-producto'), '');
  }, 0);
});


const formOferta = $('form-oferta');
const selProducto = $('oferta-producto');
const inpDescuento = $('oferta-descuento');
const camposOferta = [selProducto, inpDescuento];

conectar(camposOferta);

function llenarSelectProductos() {
  const productos = leer(KEY_PRODUCTOS);
  const actual = selProducto.value;

  selProducto.replaceChildren(
    new Option(productos.length ? 'Selecciona un producto' : 'No hay productos registrados', '')
  );
  productos.forEach((p) => {
    selProducto.add(new Option(`${p.codigo} — ${p.nombre} (${moneda.format(p.precio)})`, p.codigo));
  });
  selProducto.value = productos.some((p) => p.codigo === actual) ? actual : '';
  $('aviso-sin-productos').hidden = productos.length > 0;
}

function actualizarCalculo() {
  const caja = $('oferta-calculo');
  const producto = leer(KEY_PRODUCTOS).find((p) => p.codigo === selProducto.value);
  if (!producto || reglas.descuento(inpDescuento.value.trim()) !== '') {
    caja.hidden = true;
    return;
  }
  const d = Number(inpDescuento.value);
  caja.textContent =
    `Precio original ${moneda.format(producto.precio)} → ` +
    `con ${d}% de descuento: ${moneda.format(calcularPrecioOferta(producto.precio, d))}`;
  caja.hidden = false;
}

selProducto.addEventListener('change', actualizarCalculo);
inpDescuento.addEventListener('input', actualizarCalculo);

formOferta.addEventListener('submit', (e) => {
  e.preventDefault();
  const resumen = $('resumen-oferta');

  const invalidos = camposOferta.filter((c) => !validar(c));
  mostrarResumen(resumen, resumenDeInvalidos(invalidos));
  if (invalidos.length) {
    invalidos[0].focus();
    return;
  }

  const producto = leer(KEY_PRODUCTOS).find((p) => p.codigo === selProducto.value);
  if (!producto) {
    mostrarResumen(resumen, 'El producto seleccionado ya no existe. Vuelve a elegirlo.');
    llenarSelectProductos();
    return;
  }

  const descuento = Number(inpDescuento.value);
  const oferta = {
    codigo: producto.codigo,
    descuento,
    precioOriginal: producto.precio,
    precioOferta: calcularPrecioOferta(producto.precio, descuento),
    fecha: new Date().toISOString(),
  };

  const ofertas = leer(KEY_OFERTAS);
  const posicion = ofertas.findIndex((o) => o.codigo === producto.codigo);
  const reemplazada = posicion >= 0;
  if (reemplazada) ofertas[posicion] = oferta;
  else ofertas.push(oferta);

  if (!guardar(KEY_OFERTAS, ofertas)) {
    mostrarResumen(resumen, 'No se pudo guardar la oferta. No hay espacio de almacenamiento en el navegador.');
    return;
  }

  mostrarResultado(
    $('resultado-oferta'),
    reemplazada ? 'Oferta actualizada en el catálogo' : 'Oferta enviada al catálogo',
    producto.imagen,
    producto.nombre,
    [
      ['Producto', producto.nombre],
      ['Código', producto.codigo],
      ['Precio original', moneda.format(oferta.precioOriginal)],
      ['Descuento', `${oferta.descuento}%`],
      ['Precio con oferta', moneda.format(oferta.precioOferta)],
    ]
  );

  formOferta.reset();
});

formOferta.addEventListener('reset', () => {
  setTimeout(() => {
    camposOferta.forEach(limpiarCampo);
    $('oferta-calculo').hidden = true;
    mostrarResumen($('resumen-oferta'), '');
  }, 0);
});

llenarSelectProductos();
