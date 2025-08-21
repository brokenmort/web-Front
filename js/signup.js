const API_URL = "https://pagina-web-finansas-b6474cfcee14.herokuapp.com/api/auth/register/";

document.getElementById("signup-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const first_name = document.getElementById("first_name").value.trim();
    const last_name = document.getElementById("last_name").value.trim();
    const birthday = document.getElementById("birthday").value;
    const phone = document.getElementById("phone").value.trim();
    const country = document.getElementById("country").value.trim();
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    const messageDiv = document.getElementById("message");

    // Validación básica
    if (!email || !first_name || !last_name || !birthday || !phone || !country || !password || !confirm_password) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "Todos los campos son obligatorios.";
        return;
    }

    if (password !== confirm_password) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "❌ Las contraseñas no coinciden.";
        return;
    }

    messageDiv.style.color = "black";
    messageDiv.textContent = "Registrando usuario...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, first_name, last_name, birthday, phone, country, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.style.color = "green";
            messageDiv.textContent = "✅ Cuenta creada con éxito. Redirigiendo a login...";
            setTimeout(() => { window.location.href = "login.html"; }, 1500);
        } else {
            messageDiv.style.color = "red";
            messageDiv.textContent = "❌ " + (data.detail || data.error || "Error creando cuenta");
        }

    } catch (err) {
        messageDiv.style.color = "red";
        messageDiv.textContent = "❌ Error de conexión: " + err.message;
    }
});
