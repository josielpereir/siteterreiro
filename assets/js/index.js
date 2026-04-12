// ================================
// HOME – PRÓXIMAS DATAS
// ================================

document.addEventListener("DOMContentLoaded", () => {
  const listaEl = document.getElementById("datasResumo");
  const datas   = JSON.parse(localStorage.getItem("datas")) || [];

  if (!listaEl) return;

  if (datas.length === 0) {
    listaEl.innerHTML = `<li class="sem-datas-msg">Nenhuma data cadastrada ainda.</li>`;
    return;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Ordena por data crescente e filtra apenas futuras/hoje
  const proximas = datas
    .map(d => ({ ...d, _date: new Date(d.data + "T00:00:00") }))
    .filter(d => d._date >= hoje)
    .sort((a, b) => a._date - b._date)
    .slice(0, 3);

  if (proximas.length === 0) {
    listaEl.innerHTML = `<li class="sem-datas-msg">Nenhuma data futura cadastrada.</li>`;
    return;
  }

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  proximas.forEach(d => {
    const dt  = d._date;
    const dia = String(dt.getDate()).padStart(2, "0");
    const mes = meses[dt.getMonth()];
    const ano = dt.getFullYear();

    const diffMs   = dt - hoje;
    const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const quando   = diffDias === 0 ? "Hoje!" : diffDias === 1 ? "Amanhã" : `Em ${diffDias} dias`;

    const li = document.createElement("li");
    li.innerHTML = `
      <span class="data-badge">📅 ${dia} ${mes} ${ano}</span>
      <span class="nome-festa">${d.descricao}</span>
      ${d.texto ? `<span class="desc-festa">${d.texto}</span>` : ""}
      <span style="font-size:12px;color:#888;margin-top:2px;">${quando}</span>
    `;
    listaEl.appendChild(li);
  });
});
