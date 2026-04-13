// ================================
// ALTERAR CREDENCIAIS – ADMIN
// ================================

if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

// Hash padrão (mesmo do login.js — fallback)
const DEFAULT_HASH = "bd0ec8e62416d08bfcc5e9a579af21207c521c06319798f5010aad2799e01baf";

async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const buffer  = await crypto.subtle.digest("SHA-256", encoder.encode(texto));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function mostrarMsg(texto, tipo) {
  const el = document.getElementById("msgFeedback");
  el.textContent = texto;
  el.className   = "msg-feedback " + tipo;
  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 4000);
}

async function alterarCredenciais() {
  const senhaAtual      = document.getElementById("senhaAtual").value;
  const novoEmail       = document.getElementById("novoEmail").value.trim().toLowerCase();
  const novaSenha       = document.getElementById("novaSenha").value;
  const confirmarSenha  = document.getElementById("confirmarSenha").value;

  // Validações
  if (!senhaAtual || !novoEmail || !novaSenha || !confirmarSenha) {
    mostrarMsg("Preencha todos os campos.", "msg-erro");
    return;
  }

  if (novaSenha.length < 6) {
    mostrarMsg("A nova senha precisa ter pelo menos 6 caracteres.", "msg-erro");
    return;
  }

  if (novaSenha !== confirmarSenha) {
    mostrarMsg("A nova senha e a confirmação não coincidem.", "msg-erro");
    return;
  }

  // Verifica senha atual
  const hashAtualSalvo  = localStorage.getItem("adminSenhaHash") || DEFAULT_HASH;
  const hashAtualDigitado = await gerarHash(senhaAtual);

  if (hashAtualDigitado !== hashAtualSalvo) {
    mostrarMsg("Senha atual incorreta.", "msg-erro");
    return;
  }

  // Salva novas credenciais (como hash)
  const novoHash = await gerarHash(novaSenha);
  localStorage.setItem("adminEmail",     novoEmail);
  localStorage.setItem("adminSenhaHash", novoHash);

  mostrarMsg("Credenciais atualizadas com sucesso!", "msg-ok");

  // Limpa campos
  document.getElementById("senhaAtual").value     = "";
  document.getElementById("novaSenha").value      = "";
  document.getElementById("confirmarSenha").value = "";
}
