// ==============================
// GALERIA PÚBLICA
// ==============================

const galerias = JSON.parse(localStorage.getItem("galerias")) || {};
const containerCards = document.querySelector(".galeria-cards");

// Se não tiver nada
if (Object.keys(galerias).length === 0) {
  containerCards.innerHTML = "<p>Nenhuma galeria disponível.</p>";
}

// Ordenar por data (mais recente primeiro) e esconder vazias
Object.entries(galerias)
  .sort((a, b) => {
    const dataA = a[0].split("-").pop();
    const dataB = b[0].split("-").pop();
    return new Date(dataB) - new Date(dataA);
  })
  .forEach(([id, g]) => {
    if (!g.fotos.length) return;

    const card = document.createElement("article");
    card.className = "card-festa";

    card.innerHTML = `
      <img src="${g.capa}" class="capa-festa" alt="${g.nome}">
      <div class="info-festa">
        <h3>${g.nome}</h3>
        <button onclick="abrirGaleria('${id}')">Ver fotos</button>
      </div>
    `;

    containerCards.appendChild(card);
  });

// ==============================
// MODAL GALERIA
// ==============================
function abrirGaleria(id) {
  const modal = document.getElementById("modalGaleria");
  const fotos = document.getElementById("fotosModal");

  fotos.innerHTML = "";

  galerias[id].fotos.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.onclick = () => abrirImagem(src);
    fotos.appendChild(img);
  });

  modal.style.display = "flex";
}

function fecharGaleria() {
  document.getElementById("modalGaleria").style.display = "none";
}

// ==============================
// MODAL IMAGEM
// ==============================
function abrirImagem(src) {
  document.getElementById("imagemAmpliada").src = src;
  document.getElementById("modalImagem").style.display = "flex";
}

function fecharImagem() {
  document.getElementById("modalImagem").style.display = "none";
}
