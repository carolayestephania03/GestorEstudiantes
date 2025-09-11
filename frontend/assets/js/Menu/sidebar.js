document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM cargado - Iniciando configuración del menú');
  
  // 🔹 Obtener elementos con verificación
  const menuToggle = document.getElementById('menuToggle');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.getElementById('overlay');
  const mainContainer = document.getElementById('mainContainer');
  
  console.log('Elementos encontrados:', {menuToggle, closeMenu, overlay, mainContainer});

  // Verificar que los elementos críticos existen
  if (!mainContainer) {
    console.error('ERROR: No se encontró el elemento con ID "mainContainer"');
    return;
  }

  // -------------------------------
  // 📌 Funciones
  // -------------------------------

  // Abrir/cerrar menú móvil
  function toggleMobileMenu() {
    console.log('Alternando menú móvil');
    mainContainer.classList.toggle('menu-mobile-open');
    console.log('Estado menu-mobile-open:', mainContainer.classList.contains('menu-mobile-open'));
  }

  // Colapsar menú (desktop)
  function toggleCollapseMenu() {
    console.log('Alternando menú colapsado');
    mainContainer.classList.toggle('menu-collapsed');
    const isCollapsed = mainContainer.classList.contains('menu-collapsed');
    localStorage.setItem('menuCollapsed', isCollapsed);
    console.log('Estado menu-collapsed:', isCollapsed);
  }

  // Ajustar menú al cargar y al redimensionar
  function adjustMenu() {
    const isCollapsed = localStorage.getItem('menuCollapsed') === 'true';
    console.log('Ajustando menú. Colapsado en localStorage:', isCollapsed);
    
    if (window.innerWidth < 1200) {
      console.log('Vista móvil detectada');
      mainContainer.classList.remove('menu-collapsed');
      mainContainer.classList.remove('menu-mobile-open');
    } else {
      console.log('Vista desktop detectada');
      if (isCollapsed) {
        mainContainer.classList.add('menu-collapsed');
      } else {
        mainContainer.classList.remove('menu-collapsed');
      }
    }
  }

  // -------------------------------
  // 📌 Configuración de eventos
  // -------------------------------

  // Botones de abrir/cerrar menú
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      console.log('Clic en menuToggle');
      e.stopPropagation();
      toggleMobileMenu();
    });
  } else {
    console.warn('No se encontró menuToggle');
  }

  if (closeMenu) {
    closeMenu.addEventListener('click', function(e) {
      console.log('Clic en closeMenu');
      e.stopPropagation();
      toggleMobileMenu();
    });
  } else {
    console.warn('No se encontró closeMenu');
  }

  if (overlay) {
    overlay.addEventListener('click', function(e) {
      console.log('Clic en overlay');
      e.stopPropagation();
      toggleMobileMenu();
    });
  } else {
    console.warn('No se encontró overlay');
  }

  // Submenús desplegables - VERSIÓN MEJORADA
  const menuToggles = document.querySelectorAll('.menu-toggle');
  console.log('Encontrados', menuToggles.length, 'elementos .menu-toggle');
  
  menuToggles.forEach(link => {
    link.addEventListener('click', function (event) {
      console.log('Clic en menu-toggle:', this);
      event.preventDefault();
      event.stopPropagation();
      
      const parentItem = this.closest('.menu-item');
      if (!parentItem) {
        console.warn('No se pudo encontrar .menu-item padre');
        return;
      }
      
      // Alternar el menú actual
      const wasOpen = parentItem.classList.contains('menu-item-open');
      console.log('Menú estaba abierto:', wasOpen);
      
      // Cerrar otros menús abiertos en el mismo nivel
      const allMenuItems = document.querySelectorAll('.menu-item');
      allMenuItems.forEach(item => {
        if (item !== parentItem && item.classList.contains('menu-item-open')) {
          console.log('Cerrando otro menú abierto:', item);
          item.classList.remove('menu-item-open');
          const otherSubmenu = item.querySelector('.menu-sub');
          if (otherSubmenu) {
            otherSubmenu.style.maxHeight = '0';
            console.log('Submenú cerrado:', otherSubmenu);
          }
        }
      });
      
      // Abrir o cerrar el menú actual
      if (!wasOpen) {
        parentItem.classList.add('menu-item-open');
        const submenu = parentItem.querySelector('.menu-sub');
        if (submenu) {
          submenu.style.maxHeight = submenu.scrollHeight + 'px';
          console.log('Submenú abierto. Altura:', submenu.scrollHeight + 'px');
        }
      } else {
        parentItem.classList.remove('menu-item-open');
        const submenu = parentItem.querySelector('.menu-sub');
        if (submenu) {
          submenu.style.maxHeight = '0';
          console.log('Submenú cerrado');
        }
      }
    });
  });

  // Ajuste inicial y al cambiar tamaño
  adjustMenu();
  window.addEventListener('resize', adjustMenu);

  // Doble clic en logo → colapsar (solo desktop)
  const appBrandLink = document.querySelector('.app-brand-link');
  if (appBrandLink) {
    appBrandLink.addEventListener('dblclick', function () {
      console.log('Doble clic en logo');
    });
  }

  console.log('Configuración del menú completada');
});