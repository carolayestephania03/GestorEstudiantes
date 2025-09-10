document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('eventForm');
  var eventModal = document.getElementById('eventModal');

  var allDayStartCheckbox = document.getElementById('allDayStart');
  var allDayEndCheckbox = document.getElementById('allDayEnd');
  var startTimeInput = document.getElementById('startTime');
  var endTimeInput = document.getElementById('endTime');

  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "iconClass": "toast-error"
  };
  
  // Deshabilitar o habilitar los campos de tiempo según la selección de todo el día
  allDayStartCheckbox.addEventListener('change', function() {
    startTimeInput.disabled = this.checked;
    if (this.checked) {
      startTimeInput.value = '00:00'; // Asegúrate de tener un valor por defecto
    }
  });

  allDayEndCheckbox.addEventListener('change', function() {
    endTimeInput.disabled = this.checked;
    if (this.checked) {
      endTimeInput.value = '00:00'; // Asegúrate de tener un valor por defecto
    }
  });

  form.onsubmit = function(event) {
    event.preventDefault();

    // Construir las fechas en formato "YYYY-MM-DD HH:MM:SS"
    var startDate = document.getElementById('startDate').value;
    var startTime = allDayStartCheckbox.checked ? '00:00:00' : (startTimeInput.value || '00:00:00') + ':00';
    var endDate = document.getElementById('endDate').value;
    var endTime = allDayEndCheckbox.checked ? '00:00:00' : (endTimeInput.value || '00:00:00') + ':00';

    var fecha_inicio = startDate + 'T' + startTime;
    var fecha_finalizacion = endDate + 'T' + endTime;
    var today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD

    // Verificar si alguna de las fechas es anterior a la fecha actual
    if (fecha_inicio < today || fecha_finalizacion < today) {
      toastr.error("Eror de selección", "No se puede establecer una fecha anterior a la fecha actual.");
      return;
  }

    var data = {
      catalogo_id: parseInt(localStorage.getItem('catalogo_id')),
      departamento_id: parseInt(document.getElementById('Departamento').value, 10),
      es_responsable: document.getElementById('btn_cumplimiento').checked ? 1 : 0, 
      eje_id: parseInt(document.getElementById('Eje').value, 10),
      dependencia_id: parseInt(document.getElementById('Dependencia').value, 10),
      pais_id: parseInt(document.getElementById('Pais').value, 10),
      activity_nombre: document.getElementById('activity_nombre').value,
      descripcion: document.getElementById('descripcion').value,
      observaciones: document.getElementById('observacion').value,
      fecha_inicio: fecha_inicio,
      fecha_finalizacion: fecha_finalizacion,
      porcentaje: 0,  
      Ubication_id: parseInt(document.getElementById('Ubication_leitz').value, 10),
      activity_estado: 1
    };

    const token = getCookie('token');

    fetch(`${ENV.API_URL}/activity`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Success:', result);
      eventModal.style.display = 'none';
      form.reset();
      location.reload(); // Recarga la página
    })
    .catch(error => {
      toastr.error("Eror de conexión", "Enlace con el servidor perdido actividades");
    });
  };
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}