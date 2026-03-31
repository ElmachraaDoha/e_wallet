const loginBtn = document.getElementById("Loginbtn");

function delayRedirect() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("login.html");
        }, 2000);
    });
}

function handleLogin() {
    loginBtn.textContent = "Loading...";
    loginBtn.disabled = true; 
    delayRedirect().then((url) => {
        document.location = url;
    });
}

loginBtn.addEventListener("click", handleLogin);