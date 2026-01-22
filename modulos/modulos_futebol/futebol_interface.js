/**
 * ARQUIVO: modulos/modulos_futebol/futebol_interface.js
 * PAPEL: Renderização Visual do Módulo Futebol
 * VERSÃO: 1.0 - Interface Premium Adaptada
 */

import { limparEspacos } from './futebol_funcoes.js';

function logInterface(msg) {
    if (typeof window.logVisual === 'function') {
        window.logVisual(`[Futebol Interface] ${msg}`);
    }
}

export function criarFichaHtml(ficha) {
    if (!ficha || !Array.isArray(ficha)) return "";
    return ficha.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-valor">${item.valor}</span>
        </div>
    `).join('');
}

/**
 * RENDERIZAÇÃO DO CARROSSEL DE VÍDEOS (Estilo Futebol Pro)
 */
function criarRelacionadosHtml(newsId, relacionados) {
    if (!relacionados || !Array.isArray(relacionados)) return "";
    return relacionados.map(rel => `
        <div class="tema-card-premium" onclick="if(window.futebol) { 
            window.futebol.trocarVideo('player-${newsId}', '${rel.idVid}');
            document.getElementById('artigo-${newsId}').scrollIntoView({behavior: 'smooth', block: 'start'});
        }">
            <div class="thumb-container-16-9">
                <img src="${limparEspacos(rel.thumb)}" class="video-thumb" alt="${rel.titulo}" loading="lazy">
                <div class="play-indicator">
                    <i class="fa-solid fa-play"></i>
                </div>
                <div class="badge-hd">HD</div>
            </div>
            <div class="video-info-overlay">
                <h4 class="video-rel-titulo">${rel.titulo}</h4>
            </div>
        </div>
    `).join('');
}

export function renderizarBotaoPaginacao(total, limite) {
    let paginationWrapper = document.getElementById('futebol-pagination-modulo');
    if (!paginationWrapper) return;

    if (total <= limite) {
        paginationWrapper.innerHTML = "";
        return;
    }

    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 80px 0; width: 100%;">
            <button class="btn-carregar-mais btn-paginacao-futebol" id="btn-carregar-mais-futebol">
                <i class="fa-solid fa-chevron-down"></i>
                <span>Ver Mais Notícias</span>
            </button>
        </div>
    `;
}

export function renderizarNoticias(noticias, limite, termoBusca = "") {
    const container = document.getElementById('container-futebol-principal');
    if (!container) return;

    const listaParaExibir = noticias.slice(0, limite);
    const totalDisponivel = noticias.length;

    if (termoBusca && listaParaExibir.length === 0) {
        container.innerHTML = `<div class="search-empty-state" style="text-align:center; padding:50px;">Nenhum lance encontrado...</div>`;
        renderizarBotaoPaginacao(0, 0);
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || (Math.floor(Math.random() * 90) + 10) + "K";
        
        // COR DINÂMICA DO FIREBASE (Ex: Verde Neymar)
        const corTema = news.cor || '#1a8f00';

        return `
        <article class="destaque-secao-premium" id="artigo-${news.id}" style="--tema-cor: ${corTema}">
          <div class="destaque-inner-layout">
            
            <div class="top-meta-row">
                <div class="badge-categoria">
                    <span class="dot"></span> ${news.categoria || 'FUTEBOL'}
                </div>
                <div class="read-time">
                    <i class="fa-regular fa-clock"></i> ${news.tempoLeitura || '3 min'}
                </div>
            </div>
            
            <div class="content-header">
              <h2 class="main-article-title">${news.titulo}</h2>
              <p class="main-article-summary">${news.resumo || ''}</p>
              
              ${news.linkArtigo ? `
                <a href="${news.linkArtigo}" target="_blank" class="btn-full-article">
                   <i class="fa-solid fa-up-right-from-square"></i> LER MATÉRIA COMPLETA
                </a>
              ` : ''}
            </div>

            <div class="tech-specs-grid">
              ${criarFichaHtml(news.ficha)}
            </div>

            <div class="main-video-frame">
                <div class="video-ratio-wrapper">
                    <iframe 
                        id="player-${news.id}" 
                        src="${limparEspacos(news.videoPrincipal)}" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        loading="lazy">
                    </iframe>
                </div>
            </div>

            <div class="premium-interaction-bar">
                <div class="interaction-left">
                    <button class="action-trigger like-trigger" onclick="this.classList.toggle('active')">
                      <i class="fa-solid fa-thumbs-up"></i> <span>Gostei</span>
                    </button>
                    <button class="action-trigger share-trigger" onclick="if(window.futebol) window.futebol.compartilharNoticia('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
                      <i class="fa-solid fa-share-nodes"></i> <span>Compartilhar</span>
                    </button>
                </div>
                <div class="interaction-right">
                    <div class="view-pill"><i class="fa-solid fa-chart-line"></i> ${viewCount}</div>
                </div>
            </div>

            <div class="related-videos-section">
                <h3 class="related-title">
                    <i class="fa-solid fa-circle-play" style="color: var(--tema-cor)"></i> VÍDEOS DA PARTIDA
                </h3>
                <div class="cinematic-carousel">
                    <div class="carousel-track">
                        ${criarRelacionadosHtml(news.id, news.relacionados)}
                    </div>
                </div>
            </div>

            <div class="community-trigger-modern" data-news-id="${news.id}" 
                 onclick="if(window.futebol) window.futebol.toggleComentarios(true, '${news.id}')">
                <div class="trigger-content">
                    <div class="avatar-group-mock">
                        <img src="https://ui-avatars.com/api/?name=F&background=1a8f00&color=fff" alt="User">
                        <div class="plus-circle">+</div>
                    </div>
                    <span>Entrar na conversa sobre este jogo...</span>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            </div>

          </div>
        </article>
      `;
    }).join('');

    renderizarBotaoPaginacao(totalDisponivel, limite);
}
