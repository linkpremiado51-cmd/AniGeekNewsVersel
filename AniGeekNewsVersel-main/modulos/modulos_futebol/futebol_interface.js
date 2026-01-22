/**
 * ARQUIVO: modulos/modulos_futebol/futebol_interface.js
 * PAPEL: Renderização Visual do Módulo Futebol com Injeção Cromática
 * VERSÃO: 9.0 - Suporte a Variáveis Dinâmicas e SPA v9
 */

import { limparEspacos } from './futebol_funcoes.js';

/**
 * RENDERIZAÇÃO DA FICHA TÉCNICA
 * Ponto 3: Agora os valores podem herdar cores via CSS
 */
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
 * RENDERIZAÇÃO DO CARROSSEL DE VÍDEOS
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
            </div>
            <div class="video-info-overlay">
                <h4 class="video-rel-titulo">${rel.titulo}</h4>
            </div>
        </div>
    `).join('');
}

/**
 * GESTÃO DO BOTÃO DE PAGINAÇÃO
 * Ponto 9: Injeção no container definido no futebol.html
 */
export function renderizarBotaoPaginacao(total, limite) {
    let paginationWrapper = document.getElementById('futebol-pagination-modulo');
    if (!paginationWrapper) return;

    if (total <= limite) {
        paginationWrapper.innerHTML = "";
        return;
    }

    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 80px 0; width: 100%;">
            <button class="btn-paginacao-futebol">
                <i class="fa-solid fa-plus-circle"></i>
                <span>Ver Mais Lances</span>
            </button>
        </div>
    `;
}

/**
 * CORE: RENDERIZAÇÃO DE NOTÍCIAS
 */
export function renderizarNoticias(noticias, limite, termoBusca = "") {
    const container = document.getElementById('container-futebol-principal');
    if (!container) return;

    const listaParaExibir = noticias.slice(0, limite);
    
    if (termoBusca && listaParaExibir.length === 0) {
        container.innerHTML = `
            <div class="search-empty-state" style="text-align:center; padding:80px; color:var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass-chart" style="font-size:3rem; opacity:0.3;"></i>
                <p style="margin-top:20px;">Nenhum lance encontrado para "${termoBusca}"</p>
            </div>`;
        renderizarBotaoPaginacao(0, 0);
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?tab=futebol&id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || (Math.floor(Math.random() * 90) + 10) + "K";
        
        // COR DINÂMICA: Se a notícia tiver cor própria no Firebase, usa ela, 
        // senão herda o verde do sistema de abas (--tema-cor)
        const corFinal = news.cor || 'var(--tema-cor, #1a8f00)';

        return `
        <article class="destaque-secao-premium" id="artigo-${news.id}" style="--accent-local: ${corFinal}">
          <div class="destaque-inner-layout">
            
            <div class="top-meta-row">
                <div class="badge-categoria" style="background: var(--accent-local)">
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
                <a href="${news.linkArtigo}" target="_blank" class="btn-full-article" style="color: var(--accent-local)">
                   <i class="fa-solid fa-newspaper"></i> LER MATÉRIA COMPLETA
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
                        allowfullscreen
                        loading="lazy">
                    </iframe>
                </div>
            </div>

            <div class="premium-interaction-bar">
                <div class="interaction-left">
                    <button class="action-trigger like-trigger">
                      <i class="fa-solid fa-heart"></i> <span>Gostar</span>
                    </button>
                    <button class="action-trigger share-trigger">
                      <i class="fa-solid fa-share-nodes"></i> <span>Compartilhar</span>
                    </button>
                </div>
                <div class="interaction-right">
                    <div class="view-pill"><i class="fa-solid fa-eye"></i> ${viewCount}</div>
                </div>
            </div>

            <div class="related-videos-section">
                <h3 class="related-title">
                    <i class="fa-solid fa-clapperboard" style="color: var(--accent-local)"></i> LANCES RELACIONADOS
                </h3>
                <div class="cinematic-carousel">
                    <div class="carousel-track">
                        ${criarRelacionadosHtml(news.id, news.relacionados)}
                    </div>
                </div>
            </div>

            <div class="community-trigger-modern" data-news-id="${news.id}">
                <div class="trigger-content">
                    <div class="avatar-group-mock" style="border-color: var(--accent-local)">
                        <img src="https://ui-avatars.com/api/?name=F&background=1a8f00&color=fff" alt="User">
                        <div class="plus-circle" style="background: var(--accent-local)">+</div>
                    </div>
                    <span>Participe do debate esportivo...</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="color: var(--accent-local)"></i>
            </div>

          </div>
        </article>
      `;
    }).join('');

    renderizarBotaoPaginacao(noticias.length, limite);
}
