let indiceActual = 0;
let imagenesCarrusel = [];
let productosGlobal = [];
let paginaActual = 1;
const usuariosPorPagina = 10;
const productosPorPagina = 10;

function cargarPagina(pagina, actualizarHistorial = true) {
  fetch(pagina)
    .then(response => {
      if (!response.ok) throw new Error('Error al cargar la página');
      return response.text();
    })
    .then(html => {
      document.getElementById('pagina').innerHTML = html;
      if (actualizarHistorial) {
        history.pushState({ pagina }, "", `?page=${pagina}`);
      }
      if (pagina.includes("home")) setTimeout(() => {
        cargarCarrusel();
        cargarHome();
      }, 50);
      if (pagina.includes("productos")) setTimeout(cargarProductos, 100);
      if (pagina.includes("nosotros")) setTimeout(cargarNosotros, 100);
      if (pagina.includes("lista_usuarios")) setTimeout(cargarUsuarios, 100);
    })
    .catch(error => {
      console.error("Error al cargar la página:", error);
      document.getElementById('pagina').innerHTML = "<p>Error al cargar la página</p>";
    });
}

function cargarUsuarios() {
  const tabla = document.getElementById("tabla-usuarios");
  const input = document.getElementById("buscador");

  if (!tabla) {
    console.warn("❌ No se encontró tabla-usuarios");
    return;
  }

  fetch("../jsons/usuarios.json")
    .then(response => response.json())
    .then(usuarios => {
      usuariosGlobal = usuarios;
      mostrarTablaUsuario(usuarios);

      if (input) {
        input.addEventListener("input", () => {
          const texto = input.value.toLowerCase();
          const filtrados = usuariosGlobal.filter(u =>
            u.nombre.toLowerCase().includes(texto)
          );
          paginaActual = 1;
          mostrarTablaUsuario(filtrados);
        });
      }
    })
    .catch(error => {
      console.error("Error al cargar usuarios:", error);
    });
}


function mostrarUsuarios(lista) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";
  lista.forEach(usuario => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="image">
        <img src="${usuario.imagen}" alt="${usuario.nombre}" onerror="this.src='../img/default.png'">
      </div>
      <span class="title">${usuario.nombre}</span>
    `;
    contenedor.appendChild(card);
  });
}

function mostrarTablaUsuario(lista) {
  const tabla = document.getElementById("tabla-usuarios");
  const paginacion = document.getElementById("paginacion");

  const totalPaginas = Math.ceil(lista.length / usuariosPorPagina);
  const inicio = (paginaActual - 1) * usuariosPorPagina;
  const fin = inicio + usuariosPorPagina;
  const usuariosPagina = lista.slice(inicio, fin);

  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${usuariosPagina.map((usuario, index) => `
        <tr>
          <td>${usuario.nombre}</td>
          <td>${usuario.email}</td>
          <td>
            <button onclick="editarUsuario(${inicio + index})">Editar</button>
            <button onclick="eliminarUsuario(${inicio + index})">Eliminar</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  paginacion.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'btn-paginacion';
    btn.onclick = () => {
      paginaActual = i;
      mostrarTablaUsuario(lista);
    };
    if (i === paginaActual) btn.style.fontWeight = 'bold';
    paginacion.appendChild(btn);
  }
}


function cargarHome() {
  const contenedor = document.getElementById("contenido-home");
  if (!contenedor) return;

  fetch("../jsons/home.json")
    .then(response => response.json())
    .then(data => {
      contenedor.innerHTML = `
        <h1>${data.titulo}</h1>

        <div class="presentacion">
          <p class="intro animado">${data.introduccion}</p>
          <h3 class="animado">¿Qué puedes hacer aquí?</h3>
          <div class="tarjetas-beneficios">
            ${data.beneficios.map(b => `
              <div class="tarjeta animado">
                <span>${b.icono}</span>
                <h4>${b.titulo}</h4>
                <p>${b.descripcion}</p>
              </div>`).join("")}
          </div>
          <p class="intro animado">${data.final}</p>
        </div>

        <div class="imagen-home">
          <img src="${data.imagenHome}" alt="Vista previa del diseño" />
        </div>
      `;
    })
    .catch(error => {
      console.error("❌ Error cargando contenido dinámico:", error);
    });
}

function cargarMenu() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const rol = usuario?.rol || "Invitado"; // Si no hay usuario, se asume "Invitado"

  fetch('../jsons/menu.json')
    .then(response => response.json())
    .then(data => {
      const menulista = document.getElementById("menu_lista");
      menulista.innerHTML = "";

      // Filtramos si no es Administrador
      const menusPermitidos = rol === "Administrador"
        ? data
        : data.filter(element =>
          element.menu !== "Lista Usuarios" &&
          element.menu !== "Lista Productos"
        );

      menusPermitidos.forEach(element => {
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



window.addEventListener('popstate', (event) => {
  const pagina = event.state?.pagina || "home.html";
  cargarPagina(pagina, false);
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    const barra = document.getElementById("usuario-barra");
    const nombre = document.getElementById("usuario-nombre");
    barra.style.display = "flex";
    nombre.textContent = `👤 ${usuario.email}`;
  }

  cargarMenu();
  cargarHome();
  const urlParams = new URLSearchParams(window.location.search);
  const pagina = urlParams.get('page') || "home.html";
  cargarPagina(pagina, false);
});


function cargarCarrusel() {
  const contenedor = document.getElementById('carrusel-imagenes');
  if (!contenedor) return;
  fetch('../jsons/carrusel.json')
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

function cambiarSlide(direccion) {
  const imagenes = document.querySelectorAll('.carrusel-img');
  if (!imagenes.length) return;
  imagenes[indiceActual].classList.remove('activa');
  indiceActual = (indiceActual + direccion + imagenes.length) % imagenes.length;
  imagenes[indiceActual].classList.add('activa');
}

function cargarProductos() {
  const contenedor = document.getElementById("contenedor-productos");
  const tabla = document.getElementById("tabla-productos");
  const input = document.getElementById("buscador");
  if (!contenedor && !tabla) {
    console.warn("❌ No se encontró contenedor-productos ni tabla-productos");
    return;
  }

  fetch("../jsons/productos.json")
    .then(response => response.json())
    .then(productos => {
      productosGlobal = productos;
      if (contenedor) mostrarProductos(productos);
      if (tabla) mostrarTabla(productos);

      if (input) {
        input.addEventListener("input", () => {
          const texto = input.value.toLowerCase();
          const filtrados = productosGlobal.filter(p =>
            p.nombre.toLowerCase().includes(texto)
          );
          paginaActual = 1;
          if (contenedor) mostrarProductos(filtrados);
          if (tabla) mostrarTabla(filtrados);
        });
      }
    })
    .catch(error => {
      console.error("Error al cargar productos:", error);
    });
}

function mostrarProductos(lista) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";
  lista.forEach(producto => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="image">
        <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='../img/default.png'">
      </div>
      <span class="title">${producto.nombre}</span>
      <span class="price">$${producto.precio}</span>
    `;
    contenedor.appendChild(card);
  });
}

function mostrarTabla(lista) {
  const tabla = document.getElementById("tabla-productos");
  const paginacion = document.getElementById("paginacion");

  const totalPaginas = Math.ceil(lista.length / productosPorPagina);
  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = lista.slice(inicio, fin);

  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Precio</th>
        <th>Categoría</th>
        <th>Stock</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${productosPagina.map(producto => `
        <tr>
          <td>${producto.nombre}</td>
          <td>$${producto.precio}</td>
          <td>${producto.categoria}</td>
          <td>${producto.stock}</td>
          <td>
            <button onclick="editarProducto('${producto.nombre}')">Editar</button>
            <button onclick="eliminarProducto('${producto.nombre}')">Eliminar</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  paginacion.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'btn-paginacion';
    btn.onclick = () => {
      paginaActual = i;
      mostrarTabla(lista);
    };
    if (i === paginaActual) btn.style.fontWeight = 'bold';
    paginacion.appendChild(btn);
  }
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

function editarProducto(nombre) {
  const producto = productosGlobal.find(p => p.nombre === nombre);
  if (!producto) return;

  document.getElementById("edit-nombre").value = producto.nombre;
  document.getElementById("edit-precio").value = producto.precio;
  document.getElementById("edit-categoria").value = producto.categoria;
  document.getElementById("edit-stock").value = producto.stock;

  document.getElementById("modal-edicion").style.display = "block";
}

function cerrarModalEdicion() {
  document.getElementById("modal-edicion").style.display = "none";
}

function eliminarProducto(nombre) {
  alert(`Eliminar producto: ${nombre}`);
}

function agregarProducto() {
  alert("Agregar nuevo producto");
}
function cargarNosotros() {
  const contenedor = document.getElementById("contenido-nosotros");
  if (!contenedor) return;

  fetch("../jsons/nosotros.json")
    .then(response => response.json())
    .then(data => {
      contenedor.innerHTML = `
        <section class="sobre-nosotros">
          <h1>${data.titulo}</h1>
          <p>${data.descripcion}</p>
        <div class="card-content">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title">${data.mision.titulo}</h3>
              <p class="card-para">${data.mision.descripcion}</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-content">
              <h3 class="card-title">${data.vision.titulo}</h3>
              <p class="card-para">${data.vision.descripcion}</p>
            </div>
          </div>
        </div>
        <h2>Valores</h2>
        <div class="cards">
        ${data.valores.map(v => `
          <div class="card1">
            <div class="bg"></div>
            <div class="blob"></div>
                <div class="valor">
                <br>
                  <h4 class="valor-titulo">${v.titulo}</h4>
                  <p class="descripcion">${v.descripcion}</p>
          </div>
          </div>
          </div>
          `).join('')}
        </section>
      `;
    })
    .catch(error => {
      console.error("❌ Error al cargar Sobre Nosotros:", error);
    });
}

