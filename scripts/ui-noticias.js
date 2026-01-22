/* ======================================================
   scripts/ui-noticias.js
   PAPEL: Consumo do cache Firebase (UI Layer)
   ====================================================== */

// ===============================
// 1. AGUARDA DADOS DO FIREBASE
// ===============================
function aguardarDadosFirebase(callback) {
    const intervalo = setInterval(() => {
        if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
            clearInterval(intervalo);
            callback();
        }
    }, 100);
}

// ===============================
// 2. RENDERIZAÇÃO DOS CARDS
// ===============================
function renderizarNoticias(lista) {
    const container = document.querySelector("#lista-noticias");
    if (!container) return;

    container.innerHTML = "";

    lista.forEach(noticia => {
        const card = document.createElement("article");
        card.className = "noticia-card";
        card.dataset.id = noticia.id;

        card.innerHTML = `
            <img src="${noticia.thumb}" alt="${noticia.titulo}">
            <div class="noticia-info">
                <h3>${noticia.titulo}</h3>
                <p>${noticia.resumo || ""}</p>
            </div>
        `;

        card.addEventListener("click", () => abrirModalNoticia(noticia));
        container.appendChild(card);
    });
}

// ===============================
// 3. MODAL DA NOTÍCIA
// ===============================
window.abrirModalNoticia = function(noticia) {
    const modal = document.querySelector("#modal-noticia");
    if (!modal) return;

    modal.querySelector(".modal-titulo").textContent = noticia.titulo;
    modal.querySelector(".modal-conteudo").innerHTML = noticia.conteudo || "";

    const iframe = modal.querySelector("iframe");
    if (iframe && noticia.videoPrincipal) {
        iframe.src = noticia.videoPrincipal;
    }

    modal.classList.add("ativo");
    history.pushState(null, "", `?id=${noticia.id}`);
};

// ===============================
// 4. FECHAR MODAL
// ===============================
document.addEventListener("click", e => {
    if (e.target.classList.contains("modal-fechar")) {
        document.querySelector("#modal-noticia")?.classList.remove("ativo");
        history.pushState(null, "", location.pathname);
    }
});

// ===============================
// 5. GATILHO DE LINK DIRETO
// ===============================
function verificarLinkDireto() {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    const noticia = window.noticiasFirebase.find(n => n.id === id);
    if (noticia) abrirModalNoticia(noticia);
}

// ===============================
// 6. INICIALIZAÇÃO
// ===============================
aguardarDadosFirebase(() => {
    renderizarNoticias(window.noticiasFirebase);
    verificarLinkDireto();
});

window.addEventListener("popstate", verificarLinkDireto);

console.log("🧩 UI Notícias: camada de consumo inicializada.");
