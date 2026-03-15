import finduserbymail from "../Model/database.js";

const mail = document.getElementById("mail");
const password = document.getElementById("password");
const loginbtn = document.getElementById("submitbtn");

loginbtn.addEventListener("click", handlelogin);

function handlelogin() {
    console.log("Login button clicked");
    let mailInput = mail.value;
    let passwordInput = password.value;

    if (mailInput === "" || passwordInput === "") {
        alert("Please fill in all fields");
        return;
    }

    loginbtn.textContent = "Loading...";

    setTimeout(() => {
        let user = finduserbymail(mailInput, passwordInput);

        if (user) {
            sessionStorage.setItem("connectedUser", JSON.stringify(user));
            document.location = "dashboard.html";
        } else {
            alert("User not found");
            loginbtn.textContent = "Se connecter";
        }
    }, 2000);
}