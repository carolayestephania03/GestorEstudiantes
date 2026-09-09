document.addEventListener("DOMContentLoaded", function () {
  async function loadOptions(url, selectId, valueField, textBuilder) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const selectElement = document.getElementById(selectId);

      if (!selectElement) {
        console.warn(`No se encontró el select con id: ${selectId}`);
        return;
      }

      selectElement.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Escoge una opción";
      defaultOption.disabled = true;
      defaultOption.selected = true;      
      selectElement.appendChild(defaultOption);
      if(selectId === "combo_materia") {
        const allOption = document.createElement("option");
        allOption.value = "Todas";
        allOption.textContent = "Todas las materias";
        selectElement.appendChild(allOption);
      }
      const items = Array.isArray(result?.data) ? result.data : [];

      items
        .filter(item => item.estado === true)
        .forEach(item => {
          const option = document.createElement("option");
          option.value = item[valueField];
          option.textContent = textBuilder(item);
          selectElement.appendChild(option);
        });

    } catch (error) {
      console.error(`Error cargando ${selectId}:`, error);
      toastr.error(`Error al cargar opciones de ${selectId}`);
    }
  }

  function formatearBimestre(numero) {
    const n = Number(numero);

    if (n === 1) return "1er Bimestre";
    if (n === 2) return "2do Bimestre";
    if (n === 3) return "3er Bimestre";
    if (n === 4) return "4to Bimestre";

    return `${n}to Bimestre`;
  }

  // Materia
  loadOptions(
    "http://localhost:8001/materia",
    "materia",
    "materia_id",
    item => item.nombre_materia
  );

  // Materia
  loadOptions(
    "http://localhost:8001/materia",
    "combo_materia",
    "materia_id",
    item => item.nombre_materia
  );

  // Tipo de tarea
  loadOptions(
    "http://localhost:8001/tipoActividad",
    "tipo_tarea",
    "tipo_actividad_id",
    item => item.descripcion_tipo
  );

  // Unidad / Ciclo
  loadOptions(
    "http://localhost:8001/ciclo",
    "Unidad",
    "ciclo_id",
    item => formatearBimestre(item.numero_ciclo)
  );

    // Unidad / Ciclo
  loadOptions(
    "http://localhost:8001/ciclo",
    "combo_bimestre",
    "ciclo_id",
    item => formatearBimestre(item.numero_ciclo)
  );
});