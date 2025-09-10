document.addEventListener('DOMContentLoaded', function() {
    // Obtener el botón de redirección
    const redirectButton = document.getElementById('redirectButton');

    // Evento click en el botón de redirección
    redirectButton.addEventListener('click', function() {    
        // Redirigir
        setTimeout(function () {
            window.location.href = './search.html';
        }, 100); // Espera breve para asegurar que los datos se guarden
    });
});