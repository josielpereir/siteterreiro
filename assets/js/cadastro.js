// ================================
// CADASTRO DE MEMBROS – ADMIN ONLY
// ================================

document.addEventListener("DOMContentLoaded", () => {

  const logado = localStorage.getItem("logado") === "true";
  const avisoAdmin    = document.getElementById("avisoAdmin");
  const secaoForm     = document.getElementById("secaoFormulario");
  const tituloCadastro = document.getElementById("tituloCadastro");
  const btnSubmit     = document.getElementById("btnSubmit");

  // Se não estiver logado: mostra aviso e esconde formulário
  if (!logado) {
    if (avisoAdmin)  avisoAdmin.style.display  = "block";
    if (secaoForm)   secaoForm.style.display   = "none";
    return;
  }

  // Logado: mostra formulário
  if (avisoAdmin) avisoAdmin.style.display = "none";
  if (secaoForm)  secaoForm.style.display  = "block";

  const form = document.getElementById("formCadastro");
  if (!form) return;

  const editarIndex = localStorage.getItem("editarIndex");
  let membros = JSON.parse(localStorage.getItem("membros")) || [];

  // Modos: edição ou cadastro novo
  if (editarIndex !== null && membros[editarIndex]) {
    const m = membros[editarIndex];
    if (tituloCadastro) tituloCadastro.textContent = "Editar Membro";
    if (btnSubmit)      btnSubmit.textContent      = "Salvar Alterações";

    document.getElementById("nome").value                 = m.nome                 || "";
    document.getElementById("nascimento").value           = m.nascimento           || "";
    document.getElementById("endereco").value             = m.endereco             || "";
    document.getElementById("telefone").value             = m.telefone             || "";
    document.getElementById("email").value                = m.email                || "";
    document.getElementById("funcao").value               = m.funcao               || "";
    document.getElementById("dataEntrada").value          = m.dataEntrada          || "";
    document.getElementById("diaPagamento").value         = m.diaPagamento         || "";
    document.getElementById("paisCabeca").value           = m.paisCabeca           || "";
    document.getElementById("batizado").value             = m.batizado             || "";
    document.getElementById("padrinhosCarnais").value     = m.padrinhosCarnais     || "";
    document.getElementById("padrinhosEspirituais").value = m.padrinhosEspirituais || "";
    document.getElementById("anosCoroado").value          = m.anosCoroado          || "";
  }

  // ================================
  // SUBMIT
  // ================================
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Preserva mensalidades existentes na edição
    let mensalidadesAnos = {};
    if (editarIndex !== null && membros[editarIndex]) {
      const existente = membros[editarIndex];
      // Migra estrutura antiga (plana) para nova (por ano)
      if (existente.mensalidadesAnos) {
        mensalidadesAnos = existente.mensalidadesAnos;
      } else if (existente.mensalidades) {
        const anoAtual = new Date().getFullYear();
        mensalidadesAnos[anoAtual] = existente.mensalidades;
      }
    }

    const membro = {
      nome:                 document.getElementById("nome").value.trim(),
      nascimento:           document.getElementById("nascimento").value,
      endereco:             document.getElementById("endereco").value.trim(),
      telefone:             document.getElementById("telefone").value.trim(),
      email:                document.getElementById("email").value.trim(),
      funcao:               document.getElementById("funcao").value.trim(),
      dataEntrada:          document.getElementById("dataEntrada").value,
      diaPagamento:         document.getElementById("diaPagamento").value,
      paisCabeca:           document.getElementById("paisCabeca").value.trim(),
      batizado:             document.getElementById("batizado").value,
      padrinhosCarnais:     document.getElementById("padrinhosCarnais").value.trim(),
      padrinhosEspirituais: document.getElementById("padrinhosEspirituais").value.trim(),
      anosCoroado:          document.getElementById("anosCoroado").value,
      mensalidadesAnos
    };

    if (editarIndex !== null) {
      membros[editarIndex] = membro;
      localStorage.removeItem("editarIndex");
      alert("Membro atualizado com sucesso!");
    } else {
      membros.push(membro);
      alert("Membro cadastrado com sucesso!");
    }

    localStorage.setItem("membros", JSON.stringify(membros));
    form.reset();
    window.location.href = "admin.html";
  });

});
