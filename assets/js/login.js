// ================================
// LOGIN ADMINISTRATIVO
// A senha é armazenada como hash SHA-256
// Quem abrir o F12 vê apenas um código
// ilegível — nunca a senha real
// ================================

// Hash padrão (SHA-256 da senha atual)
// Para alterar email/senha: acesse admin-senha.html
const DEFAULT_EMAIL = "lucilene1208santos@gmail.com";
const DEFAULT_HASH  = "bd0ec8e62416d08bfcc5e9a579af21207c521c06319798f5010aad2799e01baf";

async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const buffer  = await crypto.subtle.digest("SHA-256", encoder.encode(texto));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

const form = document.getElementById("formLogin");
const msg  = document.getElementById("msgLogin");

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const emailDigitado = document.getElementById("loginEmail").value.trim().toLowerCase();
  const senhaDigitada = document.getElementById("loginSenha").value;

  // Usa credenciais salvas pelo painel admin, ou usa o padrão acima
  const emailSalvo = localStorage.getItem("adminEmail") || DEFAULT_EMAIL;
  const hashSalvo  = localStorage.getItem("adminSenhaHash") || DEFAULT_HASH;

  const hashDigitado = await gerarHash(senhaDigitada);

  if (emailDigitado === emailSalvo && hashDigitado === hashSalvo) {
    localStorage.setItem("logado", "true");
    localStorage.setItem("usuarioLogado", "admin");
    window.location.href = "admin.html";
  } else {
    msg.textContent = "E-mail ou senha inválidos.";
  }
});
