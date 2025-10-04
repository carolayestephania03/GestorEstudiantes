document.addEventListener("DOMContentLoaded", function () {
    let rol_id = sessionStorage.getItem("role_id"); // Asegúrate de obtener el rol correctamente
    // Seleccionamos solo el <ul> con id="accordionSidebar"
    let sidebarMenu = document.getElementById("accordionSidebar");
    let comboBoxGradSec = document.getElementById("Selec-gradSec");

    if (sidebarMenu) {
        // Primero, ocultamos todos los <li> dentro de este <ul>
        sidebarMenu.querySelectorAll("li").forEach(li => {
            li.style.display = "none";
        });

        if (rol_id == "D") {
            // Mostrar solo los elementos permitidos para el rol 2
            let enlacesRolDirector = ["EnlaceInicio", "EnlaceTarea", "EnlaceAlumno", "EnlacePanelControl", "EnlaceMaestro", "EnlaceEncargado"];
            enlacesRolDirector.forEach(id => {
                let elemento = sidebarMenu.querySelector(`#${id}`);
                if (elemento) {
                    elemento.closest("li").style.display = "list-item"; // Mostramos el <li> correspondiente
                }
            });
            comboBoxGradSec.style.display = "block";
        } else if (rol_id == "M") {
            // Mostrar solo los elementos permitidos para el rol 2
            let enlacesRolMaestro = ["EnlaceInicio", "EnlaceTarea", "EnlaceAlumno", "EnlaceReportes", "EnlaceAlertas", "EnlaceEncargado"];
            enlacesRolMaestro.forEach(id => {
                let elemento = sidebarMenu.querySelector(`#${id}`);
                if (elemento) {
                    elemento.closest("li").style.display = "list-item"; // Mostramos el <li> correspondiente
                }
            });
            comboBoxGradSec.style.display = "none";
        } else {
            sidebarMenu.querySelectorAll("li").forEach(li => {
                li.style.display = "none";
            });
            comboBoxGradSec.style.display = "none";
        }
    }
});