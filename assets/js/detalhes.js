// ================================
// FICHA DO MEMBRO – DETALHES
// ================================

if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

let anoSelecionado = new Date().getFullYear();

// ================================
// HELPERS DE MENSALIDADES
// ================================
function getMensalidadesAno(membro, ano) {
  const empty = {};
  MESES.forEach(m => empty[m] = false);
  if (membro.mensalidadesAnos && membro.mensalidadesAnos[ano]) {
    return Object.assign({}, empty, membro.mensalidadesAnos[ano]);
  }
  // Retrocompatibilidade com estrutura antiga (plana)
  if (String(ano) === String(new Date().getFullYear()) && membro.mensalidades) {
    return Object.assign({}, empty, membro.mensalidades);
  }
  return empty;
}

function saveMensalidade(membroIdx, ano, mes, valor) {
  const membros = JSON.parse(localStorage.getItem("membros")) || [];
  const m = membros[membroIdx];
  if (!m) return;

  // Migra estrutura antiga se necessário
  if (!m.mensalidadesAnos) {
    m.mensalidadesAnos = {};
    if (m.mensalidades) {
      m.mensalidadesAnos[new Date().getFullYear()] = Object.assign({}, m.mensalidades);
      delete m.mensalidades;
    }
  }

  if (!m.mensalidadesAnos[ano]) {
    const empty = {};
    MESES.forEach(mes => empty[mes] = false);
    m.mensalidadesAnos[ano] = empty;
  }

  m.mensalidadesAnos[ano][mes] = valor;
  membros[membroIdx] = m;
  localStorage.setItem("membros", JSON.stringify(membros));
}

// ================================
// CARREGA MEMBRO
// ================================
const index   = localStorage.getItem("membroIndex");
let   membros = JSON.parse(localStorage.getItem("membros")) || [];

if (index === null || !membros[index]) {
  alert("Membro não encontrado.");
  window.location.href = "admin.html";
}

const membro = membros[index];

// ================================
// RENDERIZA FICHA
// ================================
function formatarData(valor) {
  if (!valor) return "—";
  const [y, m, d] = valor.split("-");
  return `${d}/${m}/${y}`;
}

const detalhesEl = document.getElementById("detalhes");
detalhesEl.innerHTML = `
  <div class="card-detalhes-header">
    <h2>${membro.nome}</h2>
    ${membro.funcao ? `<span class="funcao-badge">${membro.funcao}</span>` : ""}
  </div>
  <div class="detalhes-grid">
    <div class="detalhe-item">
      <span class="detalhe-label">Nascimento</span>
      <span class="detalhe-valor">${formatarData(membro.nascimento)}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Entrada na casa</span>
      <span class="detalhe-valor">${formatarData(membro.dataEntrada)}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Telefone</span>
      <span class="detalhe-valor">${membro.telefone || "—"}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">E-mail</span>
      <span class="detalhe-valor">${membro.email || "—"}</span>
    </div>
    <div class="detalhe-item full-width">
      <span class="detalhe-label">Endereço</span>
      <span class="detalhe-valor">${membro.endereco || "—"}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Dia de pagamento</span>
      <span class="detalhe-valor">${membro.diaPagamento ? "Todo dia " + membro.diaPagamento : "—"}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Valor da mensalidade</span>
      <span class="detalhe-valor">${membro.valorMensalidade ? "R$ " + parseFloat(membro.valorMensalidade).toFixed(2).replace(".", ",") : "—"}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Batizado</span>
      <span class="detalhe-valor">${membro.batizado === "sim" ? "Sim" : membro.batizado === "nao" ? "Não" : "—"}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Pais de cabeça</span>
      <span class="detalhe-valor">${membro.paisCabeca || "—"}</span>
    </div>
    <div class="detalhe-item">
      <span class="detalhe-label">Anos coroado</span>
      <span class="detalhe-valor">${membro.anosCoroado || "—"}</span>
    </div>
    <div class="detalhe-item full-width">
      <span class="detalhe-label">Padrinhos carnais</span>
      <span class="detalhe-valor">${membro.padrinhosCarnais || "—"}</span>
    </div>
    <div class="detalhe-item full-width">
      <span class="detalhe-label">Padrinhos espirituais</span>
      <span class="detalhe-valor">${membro.padrinhosEspirituais || "—"}</span>
    </div>
  </div>
`;

// ================================
// SELETOR DE ANO
// ================================
function renderAnoSeletor() {
  const container = document.getElementById("anoSeletor");
  const anoAtual  = new Date().getFullYear();
  const anos = [];
  for (let a = anoAtual + 1; a >= 2020; a--) anos.push(a);

  container.innerHTML = anos.map(ano => `
    <button class="ano-btn ${ano === anoSelecionado ? "ativo" : ""}"
            onclick="selecionarAno(${ano})">${ano}</button>
  `).join("");
}

function selecionarAno(ano) {
  anoSelecionado = ano;
  renderAnoSeletor();
  renderMensalidades();
}

// ================================
// RENDERIZA MENSALIDADES
// ================================
function renderMensalidades() {
  // Recarrega membros para ter dados atualizados
  const membrosAtuais = JSON.parse(localStorage.getItem("membros")) || [];
  const membroAtual   = membrosAtuais[index];
  if (!membroAtual) return;

  const mens    = getMensalidadesAno(membroAtual, anoSelecionado);
  const pagosCnt = MESES.filter(m => mens[m]).length;
  const pendCnt  = 12 - pagosCnt;

  // Resumo + botões de ação rápida
  const resumoEl = document.getElementById("mensResumo");
  resumoEl.innerHTML = `
    <span class="mens-resumo-item item-pago">✓ ${pagosCnt} pago${pagosCnt !== 1 ? "s" : ""}</span>
    <span class="mens-resumo-item item-pendente">✗ ${pendCnt} pendente${pendCnt !== 1 ? "s" : ""}</span>
    <button onclick="marcarTodas(true)"  class="btn-marcar-todas btn-marcar-pago">✓ Marcar todas como pagas</button>
    <button onclick="marcarTodas(false)" class="btn-marcar-todas btn-marcar-nao">✗ Desmarcar todas</button>
  `;

  // Tabela
  const tbody = document.getElementById("listaMensalidades");
  tbody.innerHTML = "";

  MESES.forEach(mes => {
    const pago = mens[mes];
    const tr   = document.createElement("tr");
    tr.className = pago ? "pago" : "nao-pago";

    tr.innerHTML = `
      <td><strong>${mes}</strong></td>
      <td>
        <input type="checkbox" ${pago ? "checked" : ""} aria-label="Marcar ${mes} como pago">
        <span>${pago ? "Pago" : "Não pago"}</span>
      </td>
    `;

    tr.querySelector("input").addEventListener("change", e => {
      saveMensalidade(index, anoSelecionado, mes, e.target.checked);
      renderMensalidades();
    });

    tbody.appendChild(tr);
  });
}

// ================================
// MARCAR TODAS DE UMA VEZ
// ================================
function marcarTodas(valor) {
  const membrosAtuais = JSON.parse(localStorage.getItem("membros")) || [];
  const m = membrosAtuais[index];
  if (!m) return;

  if (!m.mensalidadesAnos) {
    m.mensalidadesAnos = {};
    if (m.mensalidades) {
      m.mensalidadesAnos[new Date().getFullYear()] = Object.assign({}, m.mensalidades);
      delete m.mensalidades;
    }
  }

  const empty = {};
  MESES.forEach(mes => empty[mes] = false);
  if (!m.mensalidadesAnos[anoSelecionado]) {
    m.mensalidadesAnos[anoSelecionado] = Object.assign({}, empty);
  }

  MESES.forEach(mes => m.mensalidadesAnos[anoSelecionado][mes] = valor);
  membrosAtuais[index] = m;
  localStorage.setItem("membros", JSON.stringify(membrosAtuais));
  renderMensalidades();
}

// ================================
// INICIALIZAÇÃO
// ================================
renderAnoSeletor();
renderMensalidades();
