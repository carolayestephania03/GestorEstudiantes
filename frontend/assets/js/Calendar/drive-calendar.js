const masterDriver = window.driver.js.driver;

document.addEventListener("DOMContentLoaded", function() {
  const manualBtn = document.getElementById("manual-btn");

  manualBtn.addEventListener("click", function(event) {
      event.preventDefault();

      const driverObj = new masterDriver({
          showProgress: true,
          steps: [
              { 
                  element: '#accordionSidebar', 
                  popover: { 
                      title: 'Menú de desplazamiento', 
                      description: 'Barra lateral que sirve para navegar por el software.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext(); // Pasar al siguiente paso
                      }
                  }
              },
              { 
                  element: '#Gestor-administrativo', 
                  popover: { 
                      title: 'Menú de inicio', 
                      description: 'Redirige al inicio del software.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext();
                      }
                  } 
              },
              { 
                  element: '#Enlace-inicio', 
                  popover: { 
                      title: 'Botón de inicio', 
                      description: 'Redirige al inicio del software.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext();
                      }
                  } 
              },
              { 
                  element: '#Enlace-calendario', 
                  popover: { 
                      title: 'Botón de calendario', 
                      description: 'Redirige al módulo de calendario donde puedes agregar y observar actividades.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext();
                      }
                  } 
              },
              { 
                  element: '#Enlace-reportes', 
                  popover: { 
                      title: 'Botón de reportes', 
                      description: 'Redirige al módulo de reportes para la impresión de reportes.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext();
                      }
                  } 
              },
              { 
                  element: '#Enlace-actividades', 
                  popover: { 
                      title: 'Botón de actividades', 
                      description: 'Redirige al módulo de actividades para observar una actividad seleccionada en el calendario para editar o agregar tareas y requerimientos.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext();
                      }
                  } 
              },
              { 
                  element: '#Enlace-panel-control', 
                  popover: { 
                      title: 'Botón de panel de control', 
                      description: 'Redirige al módulo de panel de control donde podrá editar, agregar, actualizar y eliminar dependencias del Ejército de Guatemala, países, cantidad de actividades anuales, entre otros.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext();
                      }
                  } 
              },
              { 
                  element: '#Enlace-alertas', 
                  popover: { 
                      title: 'Botón de alertas', 
                      description: 'Redirige al módulo de alertas, donde podrá observar las actividades próximas a la fecha actual.', 
                      side: "right", 
                      align: 'start',
                      onNextClick: () => {
                          driverObj.moveNext(); 
                      }
                  } 
              },
              { 
                element: '#Enlace-notificaciones', 
                popover: { 
                    title: 'Botón de notificaciones', 
                    description: 'Muestra la cantidad de actividades son próximas a realizarse y su información.', 
                    side: "right", 
                    align: 'start',
                    onNextClick: () => {
                        driverObj.moveNext(); 
                    }
                } 
              },
              { 
                element: '#enlace-info-perfil', 
                popover: { 
                    title: 'Botón de perfil', 
                    description: 'Permite al usuario editar su información y cerrar sesión.', 
                    side: "right", 
                    align: 'start',
                    onNextClick: () => {
                        driverObj.moveNext(); 
                    }
                } 
              },
              { 
                  popover: { 
                      title: 'Funciones de módulo Calendario', 
                      description: 'Iniciamos con la explicación del módulo de calendario.', 
                      onNextClick: () => {
                          // Aquí iniciamos la segunda parte de los pasos
                          startSecondPart();
                      }
                  } 
              }
          ]
      });

      driverObj.drive();

      function startSecondPart() {
          const driverInicio = new masterDriver({
              showProgress: true,
              steps: [
                { 
                    element: '#Calendar-title1', 
                    popover: { 
                      title: 'Título de calendario', 
                      description: 'En la parte inferior podrás observar un calendario con información sobre las diferentes actividades que se llevarán a cabo.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: 'button[title="Previous month"]', 
                    popover: { 
                      title: 'Botón regresar', 
                      description: 'Al presionar el botón podrá regresar un mes, semana o día; dependiendo del modo de calendario seleccionado.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: 'button[title="Next month"]', 
                    popover: { 
                      title: 'Botón avanzar', 
                      description: 'Al presionar el botón podrá avanzar un mes, semana o día; dependiendo del modo de calendario seleccionado.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: 'button[title="This month"]', 
                    popover: { 
                      title: 'Botón fecha actual', 
                      description: 'Al presionar el botón podrá regresar al mes, semana o día en transcurso; dependiendo del modo de calendario seleccionado.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: 'button[title="month view"]', 
                    popover: { 
                      title: 'Botón modo mes', 
                      description: 'Al presionar el botón podrá ver el calendario por mes.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: 'button[title="week view"]', 
                    popover: { 
                      title: 'Botón modo semana', 
                      description: 'Al presionar el botón podrá ver el calendario por semana.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: 'button[title="day view"]', 
                    popover: { 
                      title: 'Botón modo día', 
                      description: 'Al presionar el botón podrá ver el calendario por día.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {                        
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    element: '#calendar', 
                    popover: { 
                      title: 'Calendario', 
                      description: 'En este calendario podrá observar las diferentes actividades registradas.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                        }
                    }
                },
                { 
                    popover: { 
                        title: 'Agregar actividades', 
                        description: 'Para agregar una actividad debe de dar clic en un día o seleccionar varios días para desplegar el formulario de agregar actividades.',
                        onNextClick: () => {
                            // Mostrar el formulario antes de pasar al siguiente paso
                            document.getElementById('eventModal').style.display = 'block';
                            
                            // Mover al siguiente paso
                            driverInicio.moveNext();
                            }
                    } 
                },
                { 
                    element: '#Formulario-actividades', 
                    popover: { 
                      title: 'Tarjeta para agregar actividades', 
                      description: 'En esta parte podrá agregar una actividad en el rango de fecha seleccionado.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#Eje', 
                    popover: { 
                      title: 'Seleccionador de eje', 
                      description: 'En esta parte podrá elegir el eje al que corresponde la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#Dependencia', 
                    popover: { 
                      title: 'Seleccionador de depenedencia', 
                      description: 'En esta parte podrá elegir la dependencia del Ejército de Guatemala encargada de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#Pais', 
                    popover: { 
                      title: 'Seleccionador de país', 
                      description: 'En esta parte podrá elegir el país donde se efectuará la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#activity_nombre', 
                    popover: { 
                      title: 'Nombre de la actividad', 
                      description: 'En esta parte podrá ingresar el nombre de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#descripcion', 
                    popover: { 
                      title: 'Descripción de la actividad', 
                      description: 'En esta parte podrá una breve descripción de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#observacion', 
                    popover: { 
                      title: 'Observación de la actividad', 
                      description: 'En esta parte podrá una breve observación de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#startDate', 
                    popover: { 
                      title: 'Fecha de inicio de la actividad', 
                      description: 'En esta parte se establecerá predefinidamente la fecha de inicio de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#allDayStart', 
                    popover: { 
                      title: 'Seleccionador de todo el día', 
                      description: 'Al dar check a este botón, se establecerá la actividad para todo el día.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#startTime', 
                    popover: { 
                      title: 'Hora de inicio de la actividad', 
                      description: 'Si la actividad inicia a una hora especifíca, se podrá agregar en este espacio.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    popover: { 
                        title: 'Observación', 
                        description: 'Si la actividad inicia y finaliza el mismo día, se recomienda colocar la hora de inicio.' 
                    } 
                  },
                  { 
                    element: '#endDate', 
                    popover: { 
                      title: 'Fecha de finalización de la actividad', 
                      description: 'En esta parte se establecerá predefinidamente la fecha de finalización de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#allDayEnd', 
                    popover: { 
                      title: 'Seleccionador de todo el día', 
                      description: 'Al dar check a este botón, se establecerá la actividad para todo el día.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#endTime', 
                    popover: { 
                      title: 'Hora de finalización de la actividad', 
                      description: 'Si la actividad finaliza a una hora especifíca, se podrá agregar en este espacio.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    popover: { 
                        title: 'Observación', 
                        description: 'Si la actividad inicia y finaliza el mismo día, se recomienda colocar la hora de finalización.' 
                    } 
                  },
                  { 
                    element: '#Ubication_leitz', 
                    popover: { 
                      title: 'Leitz donde se almacenará la actividad', 
                      description: 'En este apartado podrá seleccionar el leitz donde se encontrará el reporte de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#Departamento', 
                    popover: { 
                      title: 'Departamento encargado de la actividad', 
                      description: 'En este apartado podrá seleccionar el departamento encargado de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#radio_responsabilidad', 
                    popover: { 
                      title: 'Responsabilidad de la actividad', 
                      description: 'En este apartado podrá seleccionar si el departamento es el responsable de la actividad.', 
                      side: "Top", 
                      align: 'center',
                      onNextClick: () => {
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      }
                    }
                  },
                  { 
                    element: '#Boton-guardar-act', 
                    popover: { 
                      title: 'Boton guardar actividad', 
                      description: 'Guarda la actividad en la base de datos.', 
                      side: "bottom", 
                      align: 'center',
                      onNextClick: () => {
                        // Ocultar el formulario después de este paso
                        document.getElementById('eventModal').style.display = 'none';
                        // Mover al siguiente paso
                        driverInicio.moveNext();
                      },
                      onDeselected: () => {
                        // Asegurarse de ocultar el formulario si el paso es deseleccionado
                        document.getElementById('eventModal').style.display = 'none';
                      }
                    }
                  },
                  { 
                    popover: { 
                        title: 'Ver información de actividades', 
                        description: 'Para observar los detalles de una actividad deberá dar clic encima de la barra de actividad que aparece en el calendario.',
                        onNextClick: () => {
                            // Mostrar el formulario antes de pasar al siguiente paso
                            document.getElementById('infoModal').style.display = 'block';
                            
                            // Mover al siguiente paso
                            driverInicio.moveNext();
                            }
                    } 
                },
                  { 
                    element: '#Informacion-actividad', 
                    popover: { 
                        title: 'Cuadro de información de la actividad', 
                        description: 'En esta sección podrás observar la información guardada de la actividad.', 
                        side: "bottom", 
                        align: 'center',
                        onNextClick: () => {
                            driverInicio.moveNext();
                        }
                    }
                  },
                  { 
                    element: '#redirectButton', 
                    popover: { 
                        title: 'Botón de detalles', 
                        description: 'Al dar clic a este botón será redireccionado al modulo de actividad para observar los detalles completos de la actividad.', 
                        side: "bottom", 
                        align: 'center',
                        onNextClick: () => {
                            driverInicio.moveNext();
                        }
                    }
                  },
                  { 
                      popover: { 
                          title: 'Funciones de módulo calendario', 
                          description: 'Finalizamos con la explicación del módulo de calendario.',
                          onNextClick: () => {
                            // Ocultar el formulario después de este paso
                            document.getElementById('infoModal').style.display = 'none';
                            // Mover al siguiente paso
                            driverInicio.moveNext();
                          },
                          onDeselected: () => {
                            // Asegurarse de ocultar el formulario si el paso es deseleccionado
                            document.getElementById('infoModal').style.display = 'none';
                          }
                      } 
                  }
              ]
          });

          driverInicio.drive();
      }
  });
});

