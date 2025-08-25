// Espera a que el DOM esté cargado para acceder a elementos
document.addEventListener("DOMContentLoaded", () => {
  // Obtiene el token guardado en sessionStorage
  const token = sessionStorage.getItem("authToken");
  // Si no hay token, redirige al login
  if (!token) return window.location.href = "index.html";

  // Selecciona todos los inputs del perfil
  const inputs = document.querySelectorAll('.profile-input');
  // Botones principales
  const editBtn = document.getElementById('edit-btn');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  // Elementos para la imagen de perfil
  const profileImageInput = document.getElementById('profile_image');
  const profileImagePreview = document.getElementById('profileImagePreview');
  const profileImage = document.getElementById('profileImage');
  const profileIcon = document.getElementById('profileIcon');

  // Referencias a modales y sus botones
  const confirmModal = document.getElementById('confirmModal');
  const successModal = document.getElementById('successModal');
  const confirmChangesBtn = document.getElementById('confirmChangesBtn');
  const cancelChangesBtn = document.getElementById('cancelChangesBtn');
  const successOkBtn = document.getElementById('successOkBtn');

  // Objeto para guardar los valores originales antes de editar
  let originalValues = {};
  // Variable para almacenar el archivo de imagen seleccionado
  let profileImageFile = null;

  // Función para cargar los datos del perfil desde tu API
  const loadProfile = async () => {
    try {
      // Realiza petición GET al endpoint protegido
      const res = await fetch("https://pagina-web-finansas-b6474cfcee14.herokuapp.com/api/auth/me/", {
        method: "GET", // Método HTTP
        headers: {
          "Content-Type": "application/json", // Tipo de contenido
          "Authorization": "Bearer " + token   // Token en header Authorization
        }
      });
      // Si la respuesta no es OK, lanza error
      if(!res.ok) throw new Error("No autorizado");
      // Parsea JSON de la respuesta
      const data = await res.json();
      // Muestra el nombre en el título (displayName)
      document.getElementById("displayName").textContent = data.first_name;
      // Recorre todas las claves y si hay un input con ese id, coloca el valor
      Object.keys(data).forEach(key => {
        const input = document.getElementById(key);
        if(input) input.value = data[key];
      });
      
      // Cargar imagen de perfil si existe
      if (data.profile_image) {
        profileImage.src = data.profile_image;
        profileImage.style.display = 'block';
        profileIcon.style.display = 'none';
      }
    } catch(err) {
      // Si hay error, alerta al usuario
      alert("❌ No se pudieron cargar los datos: " + err.message);
    }
  };

  // Carga el perfil al iniciar
  loadProfile();

  // Evento para seleccionar imagen
  profileImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      profileImageFile = file;
      const reader = new FileReader();
      reader.onload = function(e) {
        profileImage.src = e.target.result;
        profileImage.style.display = 'block';
        profileIcon.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  // Evento al hacer clic en "Editar"
  editBtn.onclick = () => {
    // Guarda valores originales y habilita los inputs para edición
    inputs.forEach(input => {
      originalValues[input.id] = input.value; // Guarda valor actual
      input.disabled = false; // Habilita edición
    });
    // Muestra botones Guardar/Cancelar y oculta Editar
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
  };

  // Al pulsar "Guardar" abre el modal de confirmación
  saveBtn.onclick = () => confirmModal.style.display = 'flex';

  // En el modal, al confirmar cambios...
  confirmChangesBtn.onclick = async () => {
    // Construye el objeto FormData para enviar datos (incluyendo archivos)
    const updatedData = new FormData();
    
    // Agrega campos de texto al FormData
    inputs.forEach(input => {
      updatedData.append(input.id, input.value);
    });
    
    // Agrega imagen si se seleccionó una nueva
    if (profileImageFile) {
      updatedData.append('profile_image', profileImageFile);
    }

    try {
      // Envía los cambios al endpoint con PUT
      const res = await fetch("https://pagina-web-finansas-b6474cfcee14.herokuapp.com/api/auth/me/", {
        method: "PUT", // Método PUT para actualizar
        headers: {
          "Authorization": "Bearer " + token   // Token
        },
        body: updatedData // Cuerpo con los nuevos datos en FormData
      });
      // Si la respuesta no es OK, lanza error
      if(!res.ok) throw new Error("Error al guardar cambios");

      // Parsea la respuesta con los datos actualizados
      const data = await res.json();

      // Vuelve a deshabilitar los inputs tras guardar
      inputs.forEach(input => input.disabled = true);
      // Actualiza el displayName por si cambió el nombre
      document.getElementById("displayName").textContent = data.first_name;

      // Cierra modal de confirmación y abre modal de éxito
      confirmModal.style.display = 'none';
      successModal.style.display = 'flex';
    } catch(err) {
      // Si falla el guardado, informa y cierra modal de confirmación
      alert("❌ " + err.message);
      confirmModal.style.display = 'none';
    }
  };

  // En el modal de confirmación, botón "Cancelar" cierra el modal
  cancelChangesBtn.onclick = () => confirmModal.style.display = 'none';

  // En el modal de éxito, al aceptar se cierra y vuelve a estado inicial de botones
  successOkBtn.onclick = () => { 
    successModal.style.display = 'none'; // Cierra modal de éxito
    saveBtn.style.display = 'none'; // Oculta Guardar
    cancelBtn.style.display = 'none'; // Oculta Cancelar
    editBtn.style.display = 'inline-block'; // Muestra Editar de nuevo
  };

  // Botón "Cancelar" (de la vista normal) revierte cambios locales y bloquea inputs
  cancelBtn.onclick = () => {
    // Restaura los valores originales guardados
    inputs.forEach(input => { 
      input.value = originalValues[input.id]; // Valor previo
      input.disabled = true; // Bloquea edición
    });
    
    // Restaurar imagen original si se había seleccionado una nueva
    if (profileImageFile) {
      profileImageFile = null;
      profileImage.style.display = 'none';
      profileIcon.style.display = 'block';
      profileImageInput.value = '';
    }
    
    // Vuelve a estado inicial de los botones
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
  };
});