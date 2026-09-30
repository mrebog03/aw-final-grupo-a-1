// Lógica de manejo de usuario: registro, login, logout, perfil y viajes asociados
// Importar funciones de los módulos de API y componentes HTML relacionados con el usuario
import * as apiUser from "./modules/rest-api-user.mjs";
import * as htmlUser from "./modules/html-components-user.mjs";

// Función para manejar el registro de un nuevo usuario
const registroHandler = async (event) => {
  event.preventDefault();
  // Obtener los valores del formulario de registro
  const form = document.forms["registroForm"];
  const nombre = form.elements["nombre"].value;
  const email = form.elements["email"].value;
  const password = form.elements["password"].value;
  const confirmPassword = form.elements["confirmPassword"].value;

  try {
    // Realizar la solicitud de registro a la API con los datos del nuevo usuario
    await apiUser.register({ nombre, email, password, confirmPassword });
    window.alert("Usuario registrado correctamente");
    // Redirigir al usuario a la página de viajes después de un registro exitoso
    window.location.href = "/viajes.html";
  } catch (error) {
    window.alert(`Error: ${error.message}`);
  }
};

// Función para manejar el inicio de sesión de un usuario existente
const loginHandler = async (event) => {
  event.preventDefault();
  // Obtener los valores del formulario de inicio de sesión
  const form = document.forms["loginForm"];
  const email = form.elements["email"].value;
  const password = form.elements["password"].value;

  try {
    // Realizar la solicitud de inicio de sesión a la API con los datos del usuario
    await apiUser.login({ email, password });
    // Redirigir al usuario a la página de viajes después de un inicio de sesión exitoso
    window.location.href = "/viajes.html";
  } catch (error) {
    window.alert(`Error: ${error.message}`);
  }
};

// Función para manejar el cierre de sesión del usuario actual
const logoutHandler = async (event) => {
  event.preventDefault();
  const confirmar = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
  // Si el usuario confirma, realizar la solicitud de cierre de sesión a la API
  if (confirmar) {
    try {
      // Realizar la solicitud de cierre de sesión a la API para finalizar la sesión del usuario actual
      await apiUser.logout();
      // Eliminar el token de autenticación almacenado en localStorage, ya que el usuario ha cerrado sesión
      localStorage.removeItem('token');
      // Redirigir al usuario a la página de inicio de sesión después de cerrar sesión
      window.location.href = "/login.html";
    } catch (error) {
      window.alert(`Error: ${error.message}`);
    }
  } else {
    console.log("Cierre de sesión cancelado por el usuario");
  }
};

// Función para cargar el perfil del usuario actual y sus viajes asociados
const cargarPerfil = async () => {
  try {
    // Obtener los datos del usuario actualmente autenticado desde la API
    const user = await apiUser.getCurrentUser();
    document.getElementById("perfil-nombre").textContent = user.nombre;
    document.getElementById("perfil-email").textContent = user.email;
    const rolElement = document.getElementById("perfil-rol");
    if (rolElement) {
      rolElement.textContent = user.rol;
    }
    // Obtener los viajes asociados al usuario actualmente autenticado desde la API
    const viajes = await apiUser.obtenerMisViajes();
    const contenedorViajes = document.getElementById("mis-viajes-list");
    if (contenedorViajes) {
      contenedorViajes.innerHTML = "";
      // Si el usuario no tiene viajes asociados, mostrar un mensaje indicando que no está apuntado a ningún viaje
      if (viajes.length === 0) {
        contenedorViajes.textContent = "No estás apuntado a ningún viaje.";
      } else {
        // Si el usuario tiene viajes asociados, crear y mostrar una tarjeta para cada viaje
        viajes.forEach(viaje => {
          const viajeHTML = htmlUser.crearTarjetaViaje(viaje);
          contenedorViajes.appendChild(viajeHTML);
        });
      }
    }
  } catch (error) {
    // Si ocurre un error al cargar el perfil o los viajes, mostrar un mensaje de error en el perfil y en la consola
    document.getElementById('perfil-nombre').textContent = 'Error al cargar';
    document.getElementById('perfil-email').textContent = error.message;
    console.error(error);
  }
};

// Función para aplicar permisos de UI según el rol del usuario autenticado
const aplicarPermisosUI = async () => {
  try {
    // Obtener los datos del usuario actualmente autenticado desde la API para determinar su rol
    const user = await apiUser.getCurrentUser();
    //
    if (user?.rol !== 'admin') {
      document.querySelectorAll('[data-admin-only]')
        .forEach(el => el.style.display = 'none');
    }
  } catch (error) {
    // Si falla, ocultamos por seguridad
    document.querySelectorAll('[data-admin-only]')
      .forEach(el => el.style.display = 'none');
  }
};

// Agregar event listeners para los formularios de registro e inicio de sesión, y para el botón de cierre de sesión
const formRegistro = document.forms["registroForm"];
const formLogin = document.forms["loginForm"];
const btnLogout = document.getElementById("btn-logout");

// Si el formulario de registro existe en la página, agregar un event listener para manejar su envío
if (formRegistro) { 
  formRegistro.addEventListener("submit", registroHandler);
}
// Si el formulario de inicio de sesión existe en la página, agregar un event listener para manejar su envío
if (formLogin) {
  formLogin.addEventListener("submit", loginHandler);
}
// Si el botón de cierre de sesión existe en la página, agregar un event listener para manejar su clic
if (btnLogout) {
  btnLogout.addEventListener("click", logoutHandler);
}

// Elemento del área de usuario en la barra de navegación
const userArea = document.querySelector(".user-area");
// Elemento del menú desplegable que se muestra al hacer clic en el área de usuario
const menuDesplegable = document.querySelector(".menu-desplegable");
// Agregar un event listener para mostrar u ocultar el menú desplegable al hacer clic en el área de usuario
if (userArea && menuDesplegable) {
  userArea.addEventListener("click", (e) => {
    if (menuDesplegable.style.display === "block") {
      menuDesplegable.style.display = "";
    } else {
      menuDesplegable.style.display = "block";
    }
    e.stopPropagation();
  });

  // Si se hace clic en cualquier otra parte fuera del menú, lo desanclamos
  document.addEventListener("click", (e) => {
    if (!userArea.contains(e.target)) {
      menuDesplegable.style.display = "";
    }
  });

}
// Al cargar la página, aplicar los permisos de UI según el rol del usuario autenticado
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("perfil-nombre")) {
    cargarPerfil();
  }
});