// ==============================
// PROTEÇÃO ADMIN
// ==============================
if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

// ==============================
// DADOS
// ==============================
const datas = JSON.parse(localStorage.getItem("datas")) || [];
let galerias = JSON.parse(localStorage.getItem("galerias")) || {};

// ==============================
// ELEMENTOS
// ==============================
const festaSelect = document.getElementById("festaSelect");
const galeriaSelect = document.getElementById("galeriaSelect");
const editarSelect = document.getElementById("editarGaleriaSelect");
const adminBox = document.getElementById("adminGaleriaBox");
const editarNome = document.getElementById("editarNome");
const listaFotos = document.getElementById("listaFotosAdmin");

// ==============================
// UTIL
// ==============================
function salvarGalerias() {
  localStorage.setItem("galerias", JSON.stringify(galerias));
}

// ==============================
// REDUZIR IMAGEM
// ==============================
function reduzirImagem(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const max = 1200;
      let w = img.width;
      let h = img.height;

      if (w > h && w > max) {
        h *= max / w;
        w = max;
      } else if (h > max) {
        w *= max / h;
        h = max;
      }

      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);

      callback(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==============================
// POPULAR FESTAS
// ==============================
datas.forEach(d => {
  const id = `${d.descricao}-${d.data}`;
  const opt = document.createElement("option");
  opt.value = id;
  opt.textContent = `${d.descricao} (${d.data})`;
  festaSelect.appendChild(opt);
});

// ==============================
// CRIAR GALERIA
// ==============================
function criarGaleria() {
  if (localStorage.getItem("logado") !== "true") { window.location.href = "login.html"; return; }
  const id = festaSelect.value;
  const capaFile = document.getElementById("capa").files[0];
  if (!id || !capaFile) return alert("Selecione a festa e a capa");

  reduzirImagem(capaFile, img => {
    galerias[id] = {
      nome: festaSelect.selectedOptions[0].textContent,
      capa: img,
      fotos: []
    };
    salvarGalerias();
    atualizarSelects();
    alert("Galeria criada!");
  });
}

// ==============================
// ADICIONAR FOTOS
// ==============================
function adicionarFotos() {
  if (localStorage.getItem("logado") !== "true") { window.location.href = "login.html"; return; }
  const id = galeriaSelect.value;
  const files = document.getElementById("fotoGaleria").files;
  if (!id || !files.length) return alert("Selecione a galeria e as fotos");

  Array.from(files).forEach(file => {
    reduzirImagem(file, img => {
      galerias[id].fotos.push(img);
      salvarGalerias();
    });
  });

  alert("Fotos adicionadas!");
}

// ==============================
// ATUALIZAR SELECTS
// ==============================
function atualizarSelects() {
  galeriaSelect.innerHTML = "";
  editarSelect.innerHTML = "<option value=''>Selecione</option>";

  Object.keys(galerias).forEach(id => {
    const o1 = document.createElement("option");
    o1.value = id;
    o1.textContent = galerias[id].nome;
    galeriaSelect.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = id;
    o2.textContent = galerias[id].nome;
    editarSelect.appendChild(o2);
  });
}
atualizarSelects();

// ==============================
// EDITAR GALERIA
// ==============================
editarSelect.addEventListener("change", () => {
  const id = editarSelect.value;
  if (!id) return;

  adminBox.style.display = "block";
  editarNome.value = galerias[id].nome;
  listaFotos.innerHTML = "";

  galerias[id].fotos.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;

    img.onclick = () => {
      if (confirm("Usar esta foto como capa?")) {
        galerias[id].capa = src;
        salvarGalerias();
        alert("Capa atualizada!");
      }
    };

    img.oncontextmenu = e => {
      e.preventDefault();
      if (confirm("Excluir esta foto?")) {
        galerias[id].fotos.splice(index, 1);
        salvarGalerias();
        editarSelect.dispatchEvent(new Event("change"));
      }
    };

    listaFotos.appendChild(img);
  });
});

// ==============================
// SALVAR EDIÇÃO
// ==============================
function salvarEdicaoGaleria() {
  if (localStorage.getItem("logado") !== "true") { window.location.href = "login.html"; return; }
  const id = editarSelect.value;
  if (!id) return;

  galerias[id].nome = editarNome.value;

  const novaCapa = document.getElementById("editarCapa").files[0];
  if (novaCapa) {
    reduzirImagem(novaCapa, img => {
      galerias[id].capa = img;
      salvarGalerias();
      atualizarSelects();
      alert("Galeria atualizada!");
    });
  } else {
    salvarGalerias();
    atualizarSelects();
    alert("Galeria atualizada!");
  }
}

// ==============================
// EXCLUIR GALERIA
// ==============================
function excluirGaleria() {
  if (localStorage.getItem("logado") !== "true") { window.location.href = "login.html"; return; }
  const id = editarSelect.value;
  if (!id) return;

  if (confirm("Excluir esta galeria inteira?")) {
    delete galerias[id];
    salvarGalerias();
    adminBox.style.display = "none";
    atualizarSelects();
  }
}
