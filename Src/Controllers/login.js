import finduserbymail  from "../Model/database.js";

const mail = document.getElementById("mail");
const password = document.getElementById("password");
const loginbtn = document.getElementById("submitbtn");

async function authenticateUser(email, pass) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const user = finduserbymail(email, pass);

    if (user) {
        return user; 
    } else {
        throw "Identifiants incorrects ou utilisateur inexistant."; 
    }
}

async function handlelogin() {
    const mailInput = mail.value;
    const passwordInput = password.value;

    if (!mailInput || !passwordInput) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    loginbtn.textContent = "Chargement...";
    loginbtn.disabled = true;

    try {
        const user = await authenticateUser(mailInput, passwordInput);

        sessionStorage.setItem("connectedUser", JSON.stringify(user));
        document.location = "dashboard.html";

    } catch (error) {
        alert(error);
        loginbtn.textContent = "Se connecter";
        loginbtn.disabled = false;
    }
}

loginbtn.addEventListener("click", handlelogin);