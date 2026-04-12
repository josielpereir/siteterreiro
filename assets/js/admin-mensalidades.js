// ================================
// CONTROLE DE MENSALIDADES – ADMIN
// ================================

if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

const MESES       = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                     "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun",
                      "Jul","Ago","Set","Out","Nov","Dez"];

let anoAtual   = new Date().getFullYear();
let filtroAtivo = "todos";
let busca       = "";

// ================================
// HELPERS
// ================================
function getMesesEsperados(ano) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  if (Number(ano) < anoAtual) return MESES;
  if (Number(ano) > anoAtual) return [];
  return MESES.slice(0, hoje.getMonth() + 1);
}

function getMensalidadesAno(membro, ano) {
  const empty = {};
  MESES.forEach(m => empty[m] = false);

  if (membro.mensalidadesAnos && membro.mensalidadesAnos[ano]) {
    return Object.assign({}, empty, membro.mensalidadesAnos[ano]);
  }
  // Retrocompatibilidade com estrutura plana antiga
  if (String(ano) === String(new Date().getFullYear()) && membro.mensalidades) {
    return Object.assign({}, empty, membro.mensalidades);
  }
  return empty;
}

function togglePagamento(membroIdx, mes) {
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

  if (!m.mensalidadesAnos[anoAtual]) {
    const empty = {};
    MESES.forEach(mes => empty[mes] = false);
    m.mensalidadesAnos[anoAtual] = empty;
  }

  m.mensalidadesAnos[anoAtual][mes] = !m.mensalidadesAnos[anoAtual][mes];
  membros[membroIdx] = m;
  localStorage.setItem("membros", JSON.stringify(membros));
  renderTudo();
}

// ================================
// RENDERIZA SELETOR DE ANO
// ================================
function renderAnos() {
  const container = document.getElementById("anoSeletor");
  const anos = [];
  for (let a = new Date().getFullYear() + 1; a >= 2020; a--) anos.push(a);

  container.innerHTML = anos.map(ano => `
    <button class="ano-btn ${ano === anoAtual ? "ativo" : ""}"
            onclick="selecionarAno(${ano})">${ano}</button>
  `).join("");
}

function selecionarAno(ano) {
  anoAtual = ano;
  renderTudo();
}

// ================================
// RENDERIZA ESTATÍSTICAS
// ================================
function renderStats(membros) {
  const statsEl = document.getElementById("mensStats");
  if (!statsEl) return;

  const esperados = getMesesEsperados(anoAtual);
  let totalCelulas = membros.length * esperados.length;
  let celulasPagas = 0;
  let emDia = 0;
  let inadimplentes = 0;

  membros.forEach(m => {
    const mens = getMensalidadesAno(m, anoAtual);
    const pagosCnt = esperados.filter(mes => mens[mes]).length;
    celulasPagas += pagosCnt;
    if (pagosCnt === esperados.length && esperados.length > 0) emDia++;
    if (pagosCnt === 0) inadimplentes++;
  });

  const comPendencias = membros.length - emDia;
  const taxa = totalCelulas > 0 ? Math.round((celulasPagas / totalCelulas) * 100) : 0;

  statsEl.innerHTML = `
    <div class="mens-stat-card">
      <span class="mens-stat-num">${membros.length}</span>
      <span class="mens-stat-label">Total de membros</span>
    </div>
    <div class="mens-stat-card card-verde">
      <span class="mens-stat-num">${emDia}</span>
      <span class="mens-stat-label">Em dia (${anoAtual})</span>
    </div>
    <div class="mens-stat-card card-vermelho">
      <span class="mens-stat-num">${comPendencias}</span>
      <span class="mens-stat-label">Com pendências</span>
    </div>
    <div class="mens-stat-card card-amarelo">
      <span class="mens-stat-num">${taxa}%</span>
      <span class="mens-stat-label">Taxa de pagamento</span>
    </div>
  `;
}

// ================================
// RENDERIZA TABELA
// ================================
function renderTabela(membros) {
  const tbody = document.getElementById("tabelaBody");
  if (!tbody) return;

  // Adiciona índice original antes de filtrar
  let lista = membros.map((m, i) => ({ ...m, _idx: i }));

  // Filtro por nome
  if (busca.trim()) {
    const termo = busca.toLowerCase();
    lista = lista.filter(m => m.nome.toLowerCase().includes(termo));
  }

  // Filtro por status
  if (filtroAtivo !== "todos") {
    lista = lista.filter(m => {
      const mens = getMensalidadesAno(m, anoAtual);
      const cnt  = MESES.filter(mes => mens[mes]).length;
      if (filtroAtivo === "em-dia")       return cnt === 12;
      if (filtroAtivo === "inadimplentes") return cnt === 0;
      if (filtroAtivo === "pendentes")    return cnt > 0 && cnt < 12;
      return true;
    });
  }

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14" class="tabela-sem-dados">Nenhum membro encontrado.</td></tr>`;
    return;
  }

  const esperadosTabela = getMesesEsperados(anoAtual);

  tbody.innerHTML = lista.map(membro => {
    const mens         = getMensalidadesAno(membro, anoAtual);
    const pagosCnt     = esperadosTabela.length > 0 ? esperadosTabela.filter(mes => mens[mes]).length : 0;
    const totalEsp     = esperadosTabela.length;

    const statusClass = (totalEsp === 0)              ? "status-em-dia"
                      : pagosCnt === totalEsp          ? "status-em-dia"
                      : pagosCnt === 0                 ? "status-inadimplente"
                      : "status-parcial";
    const totalTexto = totalEsp > 0 ? `${pagosCnt}/${totalEsp}` : "—";

    const celulas = MESES.map(mes => {
      const pago = mens[mes];
      return `<td class="celula-mes ${pago ? "pago" : "nao-pago"}"
                  data-index="${membro._idx}"
                  data-mes="${mes}"
                  title="${mes}: ${pago ? "Pago — clique para desmarcar" : "Não pago — clique para marcar"}">
        ${pago ? "✓" : "✗"}
      </td>`;
    }).join("");

    return `
      <tr>
        <td class="td-nome-cell">
          <div class="nome-membro-info">
            <span class="nome-membro-texto">${membro.nome}</span>
            ${membro.funcao ? `<span class="funcao-membro-texto">${membro.funcao}</span>` : ""}
            ${membro.diaPagamento ? `<span class="dia-pag-badge">Dia ${membro.diaPagamento}</span>` : ""}
          </div>
        </td>
        ${celulas}
        <td class="td-total ${statusClass}">${totalTexto}</td>
      </tr>
    `;
  }).join("");

  // Eventos de clique nas células
  tbody.querySelectorAll(".celula-mes").forEach(cel => {
    cel.addEventListener("click", () => {
      const idx = parseInt(cel.dataset.index);
      const mes = cel.dataset.mes;
      togglePagamento(idx, mes);
    });
  });
}

// ================================
// RENDER GERAL
// ================================
function renderTudo() {
  const membros = JSON.parse(localStorage.getItem("membros")) || [];
  renderAnos();
  renderStats(membros);
  renderTabela(membros);
}

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener("DOMContentLoaded", () => {

  // Busca por nome
  const inputBusca = document.getElementById("buscarMembro");
  if (inputBusca) {
    inputBusca.addEventListener("input", e => {
      busca = e.target.value;
      renderTudo();
    });
  }

  // Botões de filtro
  document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
      btn.classList.add("ativo");
      filtroAtivo = btn.dataset.filtro;
      renderTudo();
    });
  });

  renderTudo();
});
