/**
 * ARQUIVO: modulos/modulos_analises/analises_interface.js
 * PAPEL: Renderização Visual das Análises
 * VERSÃO: 7.0 - Fix de Injeção em SPA e Unificação de CSS
 */

import { limparEspacos } from './analises_funcoes.js';

function logInterface(msg) {
    if (typeof window.logVisual === 'function') {
        window.logVisual(`[Interface] ${msg}`);
    }
}

// ... (Funções criarFichaHtml e criarRelacionadosHtml permanecem iguais) ...

export function criarFichaHtml(ficha) {
    if (!ficha || !Array.isArray(ficha)) return "";
    return ficha.map(item => `
        <div class="info-item">
            <span class="info-label">${item.label}</span>
            <span class="info-valor">${item.valor}</span>
        </div>
    `).join('');
}

function criarRelacionadosHtml(newsId, relacionados) {
    if (!relacionados || !Array.isArray(relacionados)) return "";
    return relacionados.map(rel => `
        <div class="tema-card" onclick="if(window.analises) { 
            window.analises.trocarVideo('player-${newsId}', '${rel.idVid}');
            document.getElementById('artigo-${newsId}').scrollIntoView({behavior: 'smooth', block: 'start'});
        }">
            <div class="thumb-wrapper">
                <img src="${limparEspacos(rel.thumb)}" class="tema-thumb" alt="${rel.titulo}" loading="lazy">
                <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
            </div>
            <div class="tema-titulo">${rel.titulo}</div>
        </div>
    `).join('');
}

export function renderizarBotaoPaginacao(total, limite) {
    // 🛡️ CORREÇÃO SPA: Se o wrapper específico sumiu, injetamos no final do dynamic-content
    let paginationWrapper = document.getElementById('novo-pagination-modulo');
    
    if (!paginationWrapper) {
        const dynamicMain = document.getElementById('dynamic-content');
        if (!dynamicMain) return;

        // Cria o wrapper dinamicamente se ele não existir
        paginationWrapper = document.createElement('div');
        paginationWrapper.id = 'novo-pagination-modulo';
        paginationWrapper.className = 'container-carregar-mais';
        dynamicMain.appendChild(paginationWrapper);
    }

    if (total <= limite) {
        paginationWrapper.innerHTML = "";
        return;
    }

    // 🛡️ UNIFICAÇÃO DE CLASSE: Usando as duas classes para garantir o estilo do geral.css
    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 80px 0; width: 100%;">
            <button class="btn-carregar-mais btn-paginacao-geek" id="btn-carregar-mais">
                <i class="fa-solid fa-chevron-down"></i>
                <span>Carregar mais análises</span>
            </button>
        </div>
    `;
}

export function renderizarNoticias(noticias, limite, termoBusca = "") {
    const container = document.getElementById('container-principal');
    
    if (!container) return;

    const listaParaExibir = noticias.slice(0, limite);
    const totalDisponivel = noticias.length;

    if (termoBusca && listaParaExibir.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:80px 20px; color:var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass-minus" style="font-size:3.5rem; margin-bottom:20px; display:block; opacity:0.2;"></i>
                <h3 style="color:var(--text-main); margin-bottom:10px;">Nenhum resultado para "${termoBusca}"</h3>
                <p>Tente outros termos ou limpe a busca.</p>
            </div>`;
        renderizarBotaoPaginacao(0, 0);
        return;
    }

    if (listaParaExibir.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:50px;">Nenhuma análise disponível.</p>`;
        renderizarBotaoPaginacao(0, 0);
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;

    container.innerHTML = listaParaExibir.map(news => {
        const shareUrl = `${baseUrl}?id=${encodeURIComponent(news.id)}`;
        const viewCount = news.views || (Math.floor(Math.random() * 50) + 10) + "K";

        return `
        <article class="destaque-secao" id="artigo-${news.id}" style="--tema-cor: ${news.cor || '#8A2BE2'}">
          <div class="destaque-padding">
            <div class="destaque-top-meta">
                <div class="destaque-categoria">
                    <i class="fa-solid fa-hashtag"></i> ${news.categoria || 'ANÁLISE'}
                </div>
                <div class="destaque-data-badge">
                    <i class="fa-regular fa-clock"></i> ${news.tempoLeitura || '5 min'}
                </div>
            </div>
            
            <div class="destaque-header">
              <h2 class="destaque-titulo">${news.titulo}</h2>
            </div>

            <p class="destaque-resumo">${news.resumo || ''}</p>
            
            <div class="destaque-info-grid">
              ${criarFichaHtml(news.ficha)}
            </div>
          </div>

          <div class="destaque-media">
            <iframe 
                id="player-${news.id}" 
                src="${limparEspacos(news.videoPrincipal)}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                loading="lazy">
            </iframe>
          </div>

          <div class="premium-actions-bar">
            <div class="actions-left">
                <button class="btn-action-premium btn-like" onclick="this.classList.toggle('active'); if(window.logVisual && this.classList.contains('active')) window.logVisual('❤️ Você curtiu esta análise!');">
                  <i class="fa-solid fa-heart"></i>
                  <span>Curtir</span>
                </button>

                <button class="btn-action-premium btn-share" onclick="if(window.analises) window.analises.compartilharNoticia('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
                  <i class="fa-solid fa-share-nodes"></i> 
                  <span>Compartilhar</span>
                </button>
            </div>

            <div class="stats-group">
                <i class="fa-solid fa-chart-line"></i>
                <span class="stats-num">${viewCount} views</span>
            </div>
          </div>

          <div class="carrossel-temas">
            <div class="carrossel-header">
                <i class="fa-solid fa-film"></i>
                <span class="temas-label">Vídeos Relacionados</span>
            </div>
            <div class="temas-scroll-wrapper">
                <div class="temas-container">
                    ${criarRelacionadosHtml(news.id, news.relacionados)}
                </div>
            </div>
          </div>

          <div class="comments-trigger-bar" data-news-id="${news.id}" 
               onclick="if(window.secaoComentarios) window.secaoComentarios.abrir('${news.id}')">
            <div class="trigger-left">
              <i class="fa-solid fa-circle-nodes"></i>
              <span>Ver discussão da comunidade...</span>
            </div>
            <div class="trigger-right">
                <i class="fa-solid fa-comments"></i>
            </div>
          </div>
        </article>
      `;
    }).join('');

    renderizarBotaoPaginacao(totalDisponivel, limite);
}
