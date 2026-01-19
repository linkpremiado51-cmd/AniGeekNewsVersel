/* ======================================================
   scripts/modal-manager.js
   PAPEL: Gerenciador Visual de Modal (Componente Passivo)
   MUDANÇA: Desacoplamento de URL, SEO Global e Firebase.
   ====================================================== */

let noticiasDaSessao = []; 
let indiceAtual = 0;

const estruturaHTML = `
<div id="modal-noticia-global">
    <div class="modal-content">
        <div class="video-header">
            <iframe id="m-video" src="" allow="autoplay; fullscreen"></iframe>
            <button class="close-modal-btn" onclick="window.fecharModalGlobal()">×</button>
        </div>
        <div class="modal-body">
            <div id="m-categoria"></div>
            <h2 id="m-titulo"></h2>
            <div id="m-ficha"></div>
            <p id="m-resumo"></p>
        </div>
        <div class="modal-nav-footer">
            <button class="btn-nav" onclick="window.navegarNoticia(-1)">
                <i class="fa-solid fa-chevron-left"></i> Anterior
            </button>
            <a id="m-link" target="_blank" class="btn-ver-artigo-modal">ABRIR MATÉRIA</a>
            <button class="btn-nav" onclick="window.navegarNoticia(1)">
                Próxima <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    </div>
</div>`;

if (!document.getElementById('modal-noticia-global')) {
    document.body.insertAdjacentHTML('beforeend', estruturaHTML);
}

/**
 * Atualiza apenas as Meta Tags para SEO dinâmico.
 * O Título da aba é agora responsabilidade do orquestrador de navegação.
 */
const atualizarSEO = (noticia) => {
    const setMeta = (property, content) => {
        let el = document.querySelector(`meta[property="${property}"]`) || 
                 document.querySelector(`meta[name="${property}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('property', property);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    };

    // Tags Open Graph e Twitter
    setMeta('og:title', noticia.titulo);
    setMeta('og:description', noticia.resumo ? noticia.resumo.substring(0, 160) : "");
    setMeta('og:image', noticia.thumb);
    setMeta('og:url', window.location.href);
    setMeta('twitter:card', 'summary_large_image');
};

/**
 * Renderiza os dados no Modal sem manipular o histórico/URL.
 */
const renderizarDadosNoModal = (noticia) => {
    if (!noticia) return;

    const cor = noticia.cor || "#ff0000";
    const modal = document.getElementById('modal-noticia-global');
    modal.style.setProperty('--tema-cor', cor);

    document.getElementById('m-categoria').innerText = noticia.categoria || "GEEK";
    document.getElementById('m-titulo').innerText = noticia.titulo;
    document.getElementById('m-resumo').innerText = noticia.resumo || "";
    document.getElementById('m-link').href = noticia.linkArtigo || "#";

    // Define o src do vídeo
    document.getElementById('m-video').src = noticia.videoPrincipal;

    const fichaContainer = document.getElementById('m-ficha');
    if (noticia.ficha && noticia.ficha.length > 0) {
        fichaContainer.style.display = 'grid';
        fichaContainer.innerHTML = noticia.ficha.map(item => `
            <div class="info-item">
                <span class="info-label">${item.label}</span>
                <span class="info-valor">${item.valor}</span>
            </div>
        `).join('');
    } else {
        fichaContainer.style.display = 'none';
    }
    
    // Atualiza apenas os metadados
    atualizarSEO(noticia);
};

/**
 * Abre o modal recebendo a notícia e, opcionalmente, a lista de contexto (Correção 2).
 */
window.abrirModalNoticia = (noticia) => {
    if (!noticia) return;
    const modal = document.getElementById('modal-noticia-global');
    
    // Agora o modal usa a lista que o módulo ou busca enviar, ou apenas a própria notícia.
    noticiasDaSessao = noticia.lista || [noticia];
    indiceAtual = noticiasDaSessao.findIndex(n => n.id === noticia.id);
    if (indiceAtual === -1) indiceAtual = 0;

    renderizarDadosNoModal(noticia);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

/**
 * Navega entre as notícias da lista injetada no modal.
 */
window.navegarNoticia = (direcao) => {
    const novoIndice = indiceAtual + direcao;
    if (novoIndice >= 0 && novoIndice < noticiasDaSessao.length) {
        indiceAtual = novoIndice;
        renderizarDadosNoModal(noticiasDaSessao[indiceAtual]);
    }
};

/**
 * Fecha o modal limpando apenas o estado visual.
 */
window.fecharModalGlobal = () => {
    const modal = document.getElementById('modal-noticia-global');
    modal.style.display = 'none';
    document.getElementById('m-video').src = "";
    document.body.style.overflow = 'auto';
    // O gerenciamento de URL de retorno agora é feito pelo orquestrador popstate ou navegacao.js
};
