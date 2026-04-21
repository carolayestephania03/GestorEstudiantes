document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  function obtenerUserData() {
    try {
      const raw = sessionStorage.getItem("userData");
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error("No se pudo leer userData:", error);
      return {};
    }
  }

  const userData = obtenerUserData();
  const rol_id = String(userData?.rol_id ?? "").trim().toUpperCase();

  const menuTareas = document.getElementById("menuTareas");
  const menuReportes = document.getElementById("menuReportes");

  const enlaces = {
    inicio: document.getElementById("EnlaceInicio"),
    tarea: document.getElementById("EnlaceTarea"),
    alumno: document.getElementById("EnlaceAlumno"),
    reportes: document.getElementById("EnlaceReportes"),
    alertas: document.getElementById("EnlaceAlertas"),
    panelControl: document.getElementById("EnlacePanelControl"),
    maestro: document.getElementById("EnlaceMaestro"),
    encargado: document.getElementById("EnlaceEncargado")
  };

  function obtenerItemMenuDesdeEnlace(enlace) {
    return enlace ? enlace.closest("li.menu-item") : null;
  }

  function setVisibleMenu(enlace, visible) {
    const item = obtenerItemMenuDesdeEnlace(enlace);
    if (!item) return;
    item.style.display = visible ? "list-item" : "none";
  }

  function obtenerSubItems(menuItem) {
    if (!menuItem) return [];
    return Array.from(menuItem.querySelectorAll(":scope > .menu-sub > li.menu-item"));
  }

  function ocultarTodosSubItems(menuItem) {
    obtenerSubItems(menuItem).forEach(item => {
      item.style.display = "none";
    });
  }

  function mostrarTodosSubItems(menuItem) {
    obtenerSubItems(menuItem).forEach(item => {
      item.style.display = "list-item";
    });
  }

  function mostrarSubItemsPorTexto(menuItem, textosPermitidos = []) {
    const permitidos = textosPermitidos.map(t => String(t).trim().toLowerCase());

    obtenerSubItems(menuItem).forEach(item => {
      const texto = String(item.textContent || "").trim().toLowerCase();
      const visible = permitidos.some(p => texto.includes(p));
      item.style.display = visible ? "list-item" : "none";
    });
  }

  function limpiarEstadoMenu(menuItem) {
    if (!menuItem) return;

    menuItem.classList.remove("open", "active");

    const toggle = menuItem.querySelector(":scope > .menu-link.menu-toggle");
    if (toggle) {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }
  }

  function abrirMenuSiTieneSubItemsVisibles(menuItem) {
    if (!menuItem) return;

    const visibles = obtenerSubItems(menuItem).some(item => item.style.display !== "none");
    if (!visibles) return;

    menuItem.classList.add("open");

    const toggle = menuItem.querySelector(":scope > .menu-link.menu-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
    }
  }

  function ocultarTodoLoControlado() {
    Object.values(enlaces).forEach(enlace => setVisibleMenu(enlace, false));

    ocultarTodosSubItems(menuTareas);
    ocultarTodosSubItems(menuReportes);

    limpiarEstadoMenu(menuTareas);
    limpiarEstadoMenu(menuReportes);
  }

  function aplicarRolDirector() {
    setVisibleMenu(enlaces.inicio, true);
    setVisibleMenu(enlaces.tarea, true);
    setVisibleMenu(enlaces.alumno, true);
    setVisibleMenu(enlaces.panelControl, true);
    setVisibleMenu(enlaces.maestro, true);

    setVisibleMenu(enlaces.reportes, false);
    setVisibleMenu(enlaces.alertas, false);
    setVisibleMenu(enlaces.encargado, false);

    mostrarSubItemsPorTexto(menuTareas, ["Calendario", "Actividades"]);
    abrirMenuSiTieneSubItemsVisibles(menuTareas);
  }

  function aplicarRolGeneral() {
    setVisibleMenu(enlaces.inicio, true);
    setVisibleMenu(enlaces.tarea, true);
    setVisibleMenu(enlaces.alumno, true);
    setVisibleMenu(enlaces.reportes, true);
    setVisibleMenu(enlaces.alertas, true);
    setVisibleMenu(enlaces.encargado, true);

    setVisibleMenu(enlaces.panelControl, false);
    setVisibleMenu(enlaces.maestro, false);

    mostrarTodosSubItems(menuTareas);
    mostrarTodosSubItems(menuReportes);

    abrirMenuSiTieneSubItemsVisibles(menuTareas);
    abrirMenuSiTieneSubItemsVisibles(menuReportes);
  }

  ocultarTodoLoControlado();

  if (rol_id === "D") {
    aplicarRolDirector();
  } else {
    aplicarRolGeneral();
  }
});