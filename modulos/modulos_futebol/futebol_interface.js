/**
 * ARQUIVO: modulos/modulos_analises/analises_interface.js
 * PAPEL: Renderização Visual Profissional com Identidade Dinâmica
 * VERSÃO: 8.0 - Cores Dinâmicas e Carrossel Cinemático
 */

import { limparEspacos } from './analises_funcoes.js';

function logInterface(msg) {
    if (typeof window.logVisual === 'function') {
        window.logVisual(`[Interface] ${msg}`);
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
 * RENDERIZAÇÃO DO CARROSSEL DE VÍDEOS (Padrão Netflix/IGN)
 */
function criarRelacionadosHtml(newsId, relacionados) {
    if (!relacionados || !Array.isArray(relacionados)) return "";
    return relacionados.map(rel => `
        <div class="tema-card-premium" onclick="if(window.analises) { 
            window.analises.trocarVideo('player-${newsId}', '${rel.idVid}');
            document.getElementById('artigo-${newsId}').scrollIntoView({behavior: 'smooth', block: 'start'});
        }">
            <div class="thumb-container-16-9">
                <img src="${limparEspacos(rel.thumb)}" class="video-thumb" alt="${rel.titulo}" loading="lazy">
                <div class="play-indicator">
                    <i class="fa-solid fa-play"></i>
                </div>
                <div class="badge-hd">4K</div>
            </div>
            <div class="video-info-overlay">
                <h4 class="video-rel-titulo">${rel.titulo}</h4>
            </div>
        </div>
    `).join('');
}

export function renderizarBotaoPaginacao(total, limite) {
    let paginationWrapper = document.getElementById('novo-pagination-modulo');
    if (!paginationWrapper) return;

    if (total <= limite) {
        paginationWrapper.innerHTML = "";
        return;
    }

    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 80px 0; width: 100%;">
            <button class="btn-carregar-mais btn-paginacao-geek" id="btn-carregar-mais">
                <i class="fa-solid fa-chevron-down"></i>
                <span>Explorar Mais Conteúdos</span>
            </button>
        </div>
    `;
}

export function renderizarNoticias(noticias, limite, termoBusca = "") {
    const container = document.getElementById('container-principal');
    if (!container) return;

    const listaParaExibir = noticias.slice(0, limite);
    const totalDisponivel = noticias.length;

    // Estado Vazio / Busca
    if (termoBusca && listaParaExibir.length === 0) {
        container.innerHTML = `<div class="search-empty-state">...</div>`;
        renderizarBotaoPaginacao(0, 0);
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || (Math.floor(Math.random() * 90) + 10) + "K";
        
        // COR DINÂMICA DO FIREBASE
        const corTema = news.cor || '#8A2BE2';

        return `
        <article class="destaque-secao-premium" id="artigo-${news.id}" style="--tema-cor: ${corTema}">
          <div class="destaque-inner-layout">
            
            <div class="top-meta-row">
                <div class="badge-categoria">
                    <span class="dot"></span> ${news.categoria || 'ANÁLISE'}
                </div>
                <div class="read-time">
                    <i class="fa-regular fa-clock"></i> ${news.tempoLeitura || '5 min'}
                </div>
            </div>
            
            <div class="content-header">
              <h2 class="main-article-title">${news.titulo}</h2>
              <p class="main-article-summary">${news.resumo || ''}</p>
              
              ${news.linkArtigo ? `
                <a href="${news.linkArtigo}" target="_blank" class="btn-full-article">
                   <i class="fa-solid fa-book-open"></i> LER ARTIGO COMPLETO
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
                      <i class="fa-solid fa-heart"></i> <span>Útil</span>
                    </button>
                    <button class="action-trigger share-trigger" onclick="if(window.analises) window.analises.compartilharNoticia('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
                      <i class="fa-solid fa-share-nodes"></i> <span>Compartilhar</span>
                    </button>
                </div>
                <div class="interaction-right">
                    <div class="view-pill"><i class="fa-solid fa-eye"></i> ${viewCount}</div>
                </div>
            </div>

            <div class="related-videos-section">
                <h3 class="related-title">
                    <i class="fa-solid fa-layer-group" style="color: var(--tema-cor)"></i> VÍDEOS RELACIONADOS
                </h3>
                <div class="cinematic-carousel">
                    <div class="carousel-track">
                        ${criarRelacionadosHtml(news.id, news.relacionados)}
                    </div>
                </div>
            </div>

            <div class="community-trigger-modern" data-news-id="${news.id}" 
                 onclick="if(window.secaoComentarios) window.secaoComentarios.abrir('${news.id}')">
                <div class="trigger-content">
                    <div class="avatar-group-mock">
                        <img src="https://ui-avatars.com/api/?name=G&background=random" alt="User">
                        <div class="plus-circle">+</div>
                    </div>
                    <span>Ver discussão da comunidade...</span>
                </div>
                <i class="fa-solid fa-chevron-right"></i>
            </div>

          </div>
        </article>
      `;
    }).join('');

    renderizarBotaoPaginacao(totalDisponivel, limite);
}
