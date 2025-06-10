let indiceActual = 0;
let imagenesCarrusel = [];

// ✅ Cargar contenido HTML dinámico
function cargarPagina(pagina, actualizarHistorial = true) {
  fetch(pagina)
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar la página');
      return response.text();
    })
    .then(html => {
      document.getElementById('pagina').innerHTML = html;

      // Actualizar la URL sin recargar
      if (actualizarHistorial) {
        history.pushState({ pagina }, "", `?page=${pagina}`);
      }

      // ✅ Detectar si es la página de home para cargar carrusel
      if (pagina.includes("home")) {
        // Esperar un microtiempo para asegurarse que #carrusel-imagenes ya está en el DOM
        setTimeout(cargarCarrusel, 50);
      }

    })
    .catch(error => {
      console.error("Error al cargar la página:", error);
      document.getElementById('pagina').innerHTML = "<p>Error al cargar la página</p>";
    });
}

// ✅ Cargar el menú desde JSON
function cargarMenu() {
  fetch('jsons/menu.json')
    .then(response => response.json())
    .then(data => {
      const menulista = document.getElementById("menu_lista");
      menulista.innerHTML = "";
      data.forEach(element => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.textContent = element.menu;
        a.href = `?page=${element.src}`;
        a.onclick = (e) => {
          e.preventDefault();
          cargarPagina(element.src);
        };
        li.appendChild(a);
        menulista.appendChild(li);
      });
    })
    .catch(error => console.error("Error al cargar el menú", error));
}

// ✅ Historial navegador (botón atrás/adelante)
window.addEventListener('popstate', (event) => {
  const pagina = event.state?.pagina || "htmls/home.html";
  cargarPagina(pagina, false);
});

// ✅ Al cargar la app por primera vez
document.addEventListener("DOMContentLoaded", () => {
  cargarMenu();

  const urlParams = new URLSearchParams(window.location.search);
  const pagina = urlParams.get('page') || "htmls/home.html";

  cargarPagina(pagina, false);
});

// ✅ Cargar carrusel desde JSON
function cargarCarrusel() {
  const contenedor = document.getElementById('carrusel-imagenes');
  if (!contenedor) return;

  fetch('jsons/carrusel.json')
    .then(response => response.json())
    .then(data => {
      imagenesCarrusel = data;
      indiceActual = 0;
      contenedor.innerHTML = '';

      data.forEach((img, index) => {
        const imagen = document.createElement('img');
        imagen.src = img.src;
        imagen.alt = img.alt;
        imagen.className = 'carrusel-img';
        if (index === 0) imagen.classList.add('activa');
        contenedor.appendChild(imagen);
      });
    });
}

// ✅ Cambiar imagen del carrusel manualmente
function cambiarSlide(direccion) {
  const imagenes = document.querySelectorAll('.carrusel-img');
  if (!imagenes.length) return;

  imagenes[indiceActual].classList.remove('activa');
  indiceActual = (indiceActual + direccion + imagenes.length) % imagenes.length;
  imagenes[indiceActual].classList.add('activa');
}
