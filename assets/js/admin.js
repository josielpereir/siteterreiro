// ================================
// PAINEL ADMINISTRATIVO – MEMBROS
// ================================

if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function getMensalidadesAno(membro, ano) {
  const empty = {};
  MESES.forEach(m => empty[m] = false);
  if (membro.mensalidadesAnos && membro.mensalidadesAnos[ano]) {
    return Object.assign({}, empty, membro.mensalidadesAnos[ano]);
  }
  if (String(ano) === String(new Date().getFullYear()) && membro.mensalidades) {
    return Object.assign({}, empty, membro.mensalidades);
  }
  return empty;
}

// Retorna quais meses devem ser verificados para o ano informado
function getMesesEsperados(ano) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  if (Number(ano) < anoAtual) return MESES;           // ano passado: todos 12
  if (Number(ano) > anoAtual) return [];               // ano futuro: nenhum
  return MESES.slice(0, hoje.getMonth() + 1);          // ano atual: até o mês atual
}

// Calcula status real considerando apenas meses vencidos
function calcularStatus(mens, ano) {
  const esperados = getMesesEsperados(ano);
  if (esperados.length === 0) return { classe: "badge-ok", texto: "Sem cobranças", pagos: 0, total: 0 };
  const pagos = esperados.filter(m => mens[m]).length;
  const total = esperados.length;
  if (pagos === total) return { classe: "badge-ok",          texto: "Em dia",               pagos, total };
  if (pagos === 0)     return { classe: "badge-inadimplente", texto: "Inadimplente",          pagos, total };
  return               { classe: "badge-pendente",           texto: `${pagos}/${total} pagos`, pagos, total };
}

document.addEventListener("DOMContentLoaded", () => {

  const lista   = document.getElementById("listaMembros");
  const totalEl = document.getElementById("totalMembros");
  const emDiaEl = document.getElementById("totalEmDia");
  const pendEl  = document.getElementById("totalPendentes");

  const membros  = JSON.parse(localStorage.getItem("membros")) || [];
  const anoAtual = new Date().getFullYear();

  // Estatísticas
  if (totalEl) totalEl.textContent = membros.length;

  let emDia = 0;
  membros.forEach(m => {
    const mens   = getMensalidadesAno(m, anoAtual);
    const status = calcularStatus(mens, anoAtual);
    if (status.classe === "badge-ok") emDia++;
  });
  const pendentes = membros.length - emDia;
  if (emDiaEl) emDiaEl.textContent = emDia;
  if (pendEl)  pendEl.textContent  = pendentes;

  if (!lista) return;

  if (membros.length === 0) {
    lista.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#888;">
        <p style="font-size:16px;margin-bottom:16px;">Nenhum membro cadastrado.</p>
        <a href="cadastro.html" class="btn-cadastrar">+ Cadastrar primeiro membro</a>
      </div>`;
    return;
  }

  // Grid de cards
  const grid = document.createElement("div");
  grid.className = "grid-membros";

  membros.forEach((membro, index) => {
    const mens   = getMensalidadesAno(membro, anoAtual);
    const status = calcularStatus(mens, anoAtual);
    const badgeClass = status.classe;
    const badgeText  = status.texto;

    const card = document.createElement("div");
    card.className = "card-membro";
    card.innerHTML = `
      <div class="card-membro-header">
        <h3>${membro.nome}</h3>
        <span class="badge-status ${badgeClass}">${badgeText}</span>
      </div>
      <p><strong>Função:</strong> ${membro.funcao || "—"}</p>
      <p><strong>Telefone:</strong> ${membro.telefone || "—"}</p>
      <p><strong>E-mail:</strong> ${membro.email || "—"}</p>
      ${membro.diaPagamento ? `<p><strong>Dia pag.:</strong> Todo dia ${membro.diaPagamento}</p>` : ""}
      <div class="acoes-membro">
        <button class="btn-ver"     data-index="${index}">Ver ficha</button>
        <button class="btn-editar"  data-index="${index}">Editar</button>
        <button class="btn-excluir" data-index="${index}">Excluir</button>
      </div>
    `;
    grid.appendChild(card);
  });

  lista.appendChild(grid);

  // Delegação de eventos
  grid.addEventListener("click", (e) => {
    const index = e.target.getAttribute("data-index");
    if (index === null) return;

    if (e.target.classList.contains("btn-ver"))     verDetalhes(index);
    if (e.target.classList.contains("btn-editar"))  editarMembro(index);
    if (e.target.classList.contains("btn-excluir")) excluirMembro(index);
  });

});

function verDetalhes(index) {
  localStorage.setItem("membroIndex", index);
  window.location.href = "detalhes.html";
}

function editarMembro(index) {
  localStorage.setItem("editarIndex", index);
  window.location.href = "cadastro.html";
}

function excluirMembro(index) {
  const membros = JSON.parse(localStorage.getItem("membros")) || [];
  if (!membros[index]) return;
  const confirmar = confirm(`Tem certeza que deseja excluir "${membros[index].nome}"?`);
  if (!confirmar) return;
  membros.splice(index, 1);
  localStorage.setItem("membros", JSON.stringify(membros));
  location.reload();
}

function logout() {
  localStorage.removeItem("logado");
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}
