const form = document.getElementById("formLogin");
const msg = document.getElementById("msgLogin");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  if (email === "lucilene1208santos@gmail.com" && senha === "tu076") {
    localStorage.setItem("logado", "true");
    window.location.href = "admin.html";
  } else {
    msg.innerText = "Login ou senha inválidos";
    msg.style.color = "red";
  }
});
