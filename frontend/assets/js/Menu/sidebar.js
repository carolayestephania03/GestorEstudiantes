document.addEventListener('DOMContentLoaded', function () {
  
  // 🔹 Obtener elementos con verificación
  const menuToggleMobile = document.getElementById('menuToggleMobile');
  const menuToggleDesktop = document.getElementById('menuToggleDesktop');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.querySelector('.layout-overlay');
  const mainContainer = document.getElementById('mainContainer');
  
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
    mainContainer.classList.toggle('menu-mobile-open');
  }

  // Colapsar/expandir menú (desktop)
  function toggleDesktopMenu() {
    mainContainer.classList.toggle('menu-collapsed');
    const isCollapsed = mainContainer.classList.contains('menu-collapsed');
    localStorage.setItem('menuCollapsed', isCollapsed);
  }

  // Ajustar menú al cargar y al redimensionar
  function adjustMenu() {
    const isCollapsed = localStorage.getItem('menuCollapsed') === 'false';
    
    if (window.innerWidth < 1200) {
      // En móvil, asegurarse de que el menú esté cerrado inicialmente
      mainContainer.classList.remove('menu-collapsed');
      mainContainer.classList.remove('menu-mobile-open');
      
      // Mostrar botón móvil, ocultar desktop
      if (menuToggleMobile) menuToggleMobile.style.display = 'block';
      if (menuToggleDesktop) menuToggleDesktop.style.display = 'none';
    } else {
      // En desktop, restaurar el estado colapsado/expandido
      if (isCollapsed) {
        mainContainer.classList.add('menu-collapsed');
      } else {
        mainContainer.classList.remove('menu-collapsed');
      }
      
      // Asegurar que el menú esté visible (no en estado móvil)
      mainContainer.classList.remove('menu-mobile-open');
      
      // Mostrar botón desktop, ocultar móvil
      if (menuToggleMobile) menuToggleMobile.style.display = 'none';
      if (menuToggleDesktop) menuToggleDesktop.style.display = 'block';
    }
  }

  // -------------------------------
  // 📌 Configuración de eventos
  // -------------------------------

  // Botones de abrir/cerrar menú
  if (menuToggleMobile) {
    menuToggleMobile.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  } else {
    console.warn('No se encontró menuToggleMobile');
  }

  if (menuToggleDesktop) {
    menuToggleDesktop.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDesktopMenu();
    });
  } else {
    console.warn('No se encontró menuToggleDesktop');
  }

  if (closeMenu) {
    closeMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  } else {
    console.warn('No se encontró closeMenu');
  }

  if (overlay) {
    overlay.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  } else {
    console.warn('No se encontró overlay');
  }

const menuToggles = document.querySelectorAll('.menu-toggle');
  
  menuToggles.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      
      const parentItem = this.closest('.menu-item');
      if (!parentItem) {
        console.warn('No se pudo encontrar .menu-item padre');
        return;
      }
      
      // Alternar el menú actual
      const wasOpen = parentItem.classList.contains('menu-item-open');
      
      // Cerrar otros menús abiertos en el mismo nivel
      const allMenuItems = document.querySelectorAll('.menu-item');
      allMenuItems.forEach(item => {
        if (item !== parentItem && item.classList.contains('menu-item-open')) {
          item.classList.remove('menu-item-open');
          const otherSubmenu = item.querySelector('.menu-sub');
          if (otherSubmenu) {
            otherSubmenu.style.maxHeight = '0';
          }
        }
      });
      
      // Abrir o cerrar el menú actual
      if (!wasOpen) {
        parentItem.classList.add('menu-item-open');
        const submenu = parentItem.querySelector('.menu-sub');
        if (submenu) {
          submenu.style.maxHeight = submenu.scrollHeight + 'px';
        }
      } else {
        parentItem.classList.remove('menu-item-open');
        const submenu = parentItem.querySelector('.menu-sub');
        if (submenu) {
          submenu.style.maxHeight = '0';
        }
      }
    });
  });
  // Ajuste inicial y al cambiar tamaño
  adjustMenu();
  window.addEventListener('resize', adjustMenu);

});