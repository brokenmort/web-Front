document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) return window.location.href = "index.html";

  const inputs = document.querySelectorAll('.profile-input');
  const editBtn = document.getElementById('edit-btn');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  const confirmModal = document.getElementById('confirmModal');
  const successModal = document.getElementById('successModal');
  const confirmChangesBtn = document.getElementById('confirmChangesBtn');
  const cancelChangesBtn = document.getElementById('cancelChangesBtn');
  const successOkBtn = document.getElementById('successOkBtn');

  let originalValues = {};

  const loadProfile = async () => {
    try {
      const res = await fetch("https://pagina-web-finansas-b6474cfcee14.herokuapp.com/api/auth/me/", {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token }
      });
      if(!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      document.getElementById("displayName").textContent = data.first_name;
      Object.keys(data).forEach(key => {
        const input = document.getElementById(key);
        if(input) input.value = data[key];
      });
    } catch(err) {
      alert("❌ No se pudieron cargar los datos: " + err.message);
    }
  };

  loadProfile();

  editBtn.onclick = () => {
    inputs.forEach(input => { originalValues[input.id] = input.value; input.disabled = false; });
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
  };

  saveBtn.onclick = () => confirmModal.style.display = 'flex';

  confirmChangesBtn.onclick = async () => {
    const updatedData = {};
    inputs.forEach(input => updatedData[input.id] = input.value);
    try {
      const res = await fetch("https://pagina-web-finansas-b6474cfcee14.herokuapp.com/api/auth/me/", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(updatedData)
      });
      if(!res.ok) throw new Error("Error al guardar cambios");
      const data = await res.json();
      inputs.forEach(input => input.disabled = true);
      document.getElementById("displayName").textContent = data.first_name;
      confirmModal.style.display = 'none';
      successModal.style.display = 'flex';
    } catch(err) {
      alert("❌ " + err.message);
      confirmModal.style.display = 'none';
    }
  };

  cancelChangesBtn.onclick = () => confirmModal.style.display = 'none';
  successOkBtn.onclick = () => { 
    successModal.style.display = 'none'; 
    saveBtn.style.display = 'none'; 
    cancelBtn.style.display = 'none'; 
    editBtn.style.display = 'inline-block'; 
  };

  cancelBtn.onclick = () => {
    inputs.forEach(input => { input.value = originalValues[input.id]; input.disabled = true; });
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
  };
});
