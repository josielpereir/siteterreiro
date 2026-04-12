// ================================
// DATAS FESTIVAS – ADMIN
// ================================

if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

const listaDatas   = document.getElementById("listaDatas");
const btnAdicionar = document.getElementById("btnAdicionarData");
const tituloForm   = document.getElementById("tituloFormData");

let datas       = JSON.parse(localStorage.getItem("datas")) || [];
let editarIndex = null;

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ================================
// RENDERIZAR LISTA
// ================================
function atualizarLista() {
  listaDatas.innerHTML = "";

  if (datas.length === 0) {
    listaDatas.innerHTML = `<li><div class="sem-datas">Nenhuma data cadastrada ainda.</div></li>`;
    return;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const futuras = datas
    .map((d, i) => ({ ...d, _idx: i, _date: new Date(d.data + "T00:00:00") }))
    .filter(d => d._date >= hoje)
    .sort((a, b) => a._date - b._date);

  const passadas = datas
    .map((d, i) => ({ ...d, _idx: i, _date: new Date(d.data + "T00:00:00") }))
    .filter(d => d._date < hoje)
    .sort((a, b) => b._date - a._date);

  if (futuras.length > 0) {
    const sec = document.createElement("li");
    sec.style.listStyle = "none";
    sec.innerHTML = `<div class="datas-secao-titulo">Próximas celebrações</div>`;
    listaDatas.appendChild(sec);
    futuras.forEach(d => listaDatas.appendChild(criarCard(d, false)));
  }

  if (passadas.length > 0) {
    const sec = document.createElement("li");
    sec.style.listStyle = "none";
    sec.innerHTML = `<div class="datas-secao-titulo" style="margin-top:${futuras.length > 0 ? "30px" : "0"}">Datas passadas</div>`;
    listaDatas.appendChild(sec);
    passadas.forEach(d => listaDatas.appendChild(criarCard(d, true)));
  }
}

// ================================
// CRIAR CARD (com botões de admin)
// ================================
function criarCard(d, passado) {
  const dt   = d._date;
  const dia  = String(dt.getDate()).padStart(2, "0");
  const mes  = MESES_CURTOS[dt.getMonth()];
  const ano  = dt.getFullYear();

  const hoje    = new Date(); hoje.setHours(0,0,0,0);
  const diffDias = Math.round((dt - hoje) / (1000*60*60*24));

  let whenBadge = "";
  if (!passado) {
    if (diffDias === 0)      whenBadge = `<span class="quando-badge hoje">🎉 Hoje!</span>`;
    else if (diffDias === 1) whenBadge = `<span class="quando-badge futuro">⏰ Amanhã</span>`;
    else                     whenBadge = `<span class="quando-badge futuro">📅 Em ${diffDias} dias</span>`;
  } else {
    whenBadge = `<span class="quando-badge passado">Realizada</span>`;
  }

  const li = document.createElement("li");
  li.style.listStyle = "none";
  li.innerHTML = `
    <div class="card-data ${passado ? "passado" : ""}">
      <div class="card-data-lateral">
        <span class="dia-num">${dia}</span>
        <span class="mes-nome">${mes}</span>
        <span class="ano-num">${ano}</span>
      </div>
      <div class="card-data-conteudo">
        <span class="nome-data">${d.descricao}</span>
        ${d.texto ? `<span class="descricao-data">${d.texto}</span>` : ""}
        ${whenBadge}
      </div>
      <div class="card-data-acoes">
        <button class="btn-editar-data"  onclick="editarData(${d._idx})">Editar</button>
        <button class="btn-excluir-data" onclick="excluirData(${d._idx})">Excluir</button>
      </div>
    </div>
  `;
  return li;
}

// ================================
// ADICIONAR / SALVAR
// ================================
function adicionarData() {
  const inputData      = document.getElementById("data");
  const inputDescricao = document.getElementById("descricao");
  const inputTexto     = document.getElementById("texto");

  if (!inputData.value || !inputDescricao.value.trim()) {
    alert("Preencha a data e o nome da festa.");
    return;
  }

  const novaData = {
    data:      inputData.value,
    descricao: inputDescricao.value.trim(),
    texto:     inputTexto.value.trim()
  };

  if (editarIndex !== null) {
    datas[editarIndex] = novaData;
    editarIndex = null;
    tituloForm.textContent   = "➕ Adicionar nova data";
    btnAdicionar.textContent = "Adicionar data";
  } else {
    datas.push(novaData);
  }

  localStorage.setItem("datas", JSON.stringify(datas));
  atualizarLista();

  inputData.value      = "";
  inputDescricao.value = "";
  inputTexto.value     = "";
}

// ================================
// EDITAR
// ================================
function editarData(index) {
  const d = datas[index];
  document.getElementById("data").value      = d.data;
  document.getElementById("descricao").value = d.descricao;
  document.getElementById("texto").value     = d.texto || "";
  editarIndex = index;

  tituloForm.textContent   = "✏️ Editar data";
  btnAdicionar.textContent = "Salvar alterações";

  document.querySelector(".admin-form-datas").scrollIntoView({ behavior: "smooth", block: "center" });
}

// ================================
// EXCLUIR
// ================================
function excluirData(index) {
  if (!confirm(`Excluir "${datas[index].descricao}"?`)) return;
  datas.splice(index, 1);
  localStorage.setItem("datas", JSON.stringify(datas));
  atualizarLista();
}

// Inicializa
atualizarLista();
