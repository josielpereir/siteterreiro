// ================================
// DATAS FESTIVAS – SOMENTE EXIBIÇÃO
// ================================

const listaDatas = document.getElementById("listaDatas");
const datas = JSON.parse(localStorage.getItem("datas")) || [];

const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function atualizarLista() {
  listaDatas.innerHTML = "";

  if (datas.length === 0) {
    listaDatas.innerHTML = `<li><div class="sem-datas">Nenhuma data festiva cadastrada.</div></li>`;
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
    </div>
  `;
  return li;
}

atualizarLista();
