document.addEventListener("DOMContentLoaded", function () {
  const token = getCookie("token");

  function loadOptions(url, selectId, valueField, textField, filterId = null) {
    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const selectElement = document.getElementById(selectId);
        selectElement.innerHTML = ""; // Limpiar el contenido existente

        // Añadir una opción predeterminada
        const defaultOption = document.createElement("option");
        defaultOption.value = "0"; // Puedes usar 'null' si prefieres
        defaultOption.textContent = "Escoge una opción"; // Texto predeterminado
        selectElement.appendChild(defaultOption);

        // Filtrar datos si se proporciona un filtro
        let filteredData = data.data;
        if (filterId) {
          const filterValue = localStorage.getItem(filterId);
          if (filterValue) {
            filteredData = data.data.filter(
              (item) => item[valueField] === parseInt(filterValue, 10)
            );
          }
        }

        // Añadir las opciones filtradas
        filteredData.forEach((item) => {
          const option = document.createElement("option");
          option.value = item[valueField];
          option.textContent = item[textField];
          selectElement.appendChild(option);
        });
      })
      .catch((error) =>
        toastr.error(`Error de conexión ${selectId}`, error)
      );
  }

  // Cargar datos para cada select
  loadOptions(`${ENV.API_URL}/eje`, "Eje", "eje_id", "description");
  loadOptions(`${ENV.API_URL}/dependencia`, "Dependencia", "dependencia_id", "description");
  loadOptions(`${ENV.API_URL}/pais`, "Pais", "pais_id", "description");
  loadOptions(`${ENV.API_URL}/ubicationActivity`, "Ubication_leitz", "ubication_id", "description_ub");
  
  // Para el select de departamento, aplicar filtro basado en localStorage
  loadOptions(`${ENV.API_URL}/departamento`, "Departamento", "departamento_id", "nombre_departamento", "departamento_id");
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
