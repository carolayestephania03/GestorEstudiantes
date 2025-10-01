document.addEventListener("DOMContentLoaded", function () {
    let rol_id = localStorage.getItem("role_id"); // Asegúrate de obtener el rol correctamente
    console.log(rol_id);
    // Seleccionamos solo el <ul> con id="accordionSidebar"
    let sidebarMenu = document.getElementById("accordionSidebar");

    if (sidebarMenu) {
        // Primero, ocultamos todos los <li> dentro de este <ul>
        sidebarMenu.querySelectorAll("li").forEach(li => {
            li.style.display = "none";
        });

        if (rol_id == 2) {
            // Mostrar solo los elementos permitidos para el rol 2
            let enlacesRol2 = ["Enlace-inicio", "Enlace-calendario", "Enlace-alertas"];
            enlacesRol2.forEach(id => {
                let elemento = sidebarMenu.querySelector(`#${id}`);
                if (elemento) {
                    elemento.closest("li").style.display = "list-item"; // Mostramos el <li> correspondiente
                }
            });
        } else if (rol_id == 3) {
            // Mostrar todos los <li> para el rol 3
            sidebarMenu.querySelectorAll("li").forEach(li => {
                li.style.display = "list-item";
            });
        }
    }
});
