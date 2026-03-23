import finduserbymail from "../Model/database.js";

const mail = document.getElementById("mail");
const password = document.getElementById("password");
const loginbtn = document.getElementById("submitbtn");


function authenticateUser(email, pass) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = finduserbymail(email, pass);
            if (user) {
                resolve(user);
            } else {
                reject("Identifiants incorrects ou utilisateur inexistant."); 
            }
        }, 2000);
    });
}

function handlelogin() {
    const mailInput = mail.value;
    const passwordInput = password.value;

    if (!mailInput || !passwordInput) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    loginbtn.textContent = "Chargement...";
    loginbtn.disabled = true;

    authenticateUser(mailInput, passwordInput)
        .then((user) => {
            sessionStorage.setItem("connectedUser", JSON.stringify(user));
            document.location = "dashboard.html";
        })
        .catch((error) => {
            alert(error);
            loginbtn.textContent = "Se connecter";
            loginbtn.disabled = false;
        });
}

loginbtn.addEventListener("click", handlelogin);