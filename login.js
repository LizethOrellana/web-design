document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        fetch("../jsons/usuarios.json")
            .then(res => res.json())
            .then(usuarios => {
                const existe = usuarios.find(u => u.email === email && u.contrasena === contrasena);

                if (existe) {
                    localStorage.setItem("email", existe.email);
                    localStorage.setItem("usuario", JSON.stringify(existe)); // Guarda todo el usuario
                    localStorage.setItem("rol", existe.rol); // También guarda el rol si lo necesitas
                    window.location.href = "../htmls/index.html";
                } else {
                    alert("❌ Usuario o contraseña incorrectos.");
                }
            })
            .catch(err => {
                console.error("Error cargando usuarios:", err);
                alert("No se pudo verificar el usuario.");
            });
    });
});
