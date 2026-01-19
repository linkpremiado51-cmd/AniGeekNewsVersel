/**
 * ARQUIVO: modulos/modulos_analises/analises_interface.js
 * PAPEL: Renderização Visual das Análises
 * VERSÃO: 4.3 - INTEGRADO COM BUSCA (FEEDBACK DE RESULTADOS)
 */

import { limparEspacos } from './analises_funcoes.js';

function logInterface(msg) {
    if (typeof window.logVisual === 'function') {
        window.logVisual(msg);
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

// ALTERADO: Adicionado controle de visibilidade baseado em resultados
export function renderizarBotaoPaginacao(mostrar = true) {
    const paginationWrapper = document.getElementById('novo-pagination-modulo');
    if (!paginationWrapper) return;

    if (!mostrar) {
        paginationWrapper.innerHTML = "";
        return;
    }

    if (paginationWrapper.querySelector('#btn-carregar-mais')) return;

    paginationWrapper.innerHTML = `
        <div style="text-align: center; padding: 20px 0 60px 0; width: 100%;">
            <button class="btn-paginacao-geek" id="btn-carregar-mais">
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

    // LÓGICA DE BUSCA: Caso não encontre nada
    if (termoBusca && listaParaExibir.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:80px 20px; color:var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass-minus" style="font-size:3.5rem; margin-bottom:20px; display:block; opacity:0.2;"></i>
                <h3 style="color:var(--text-main); margin-bottom:10px;">Nenhum resultado para "${termoBusca}"</h3>
                <p>Tente termos mais genéricos ou verifique a ortografia.</p>
            </div>`;
        renderizarBotaoPaginacao(false); // Oculta o botão se não há resultados
        return;
    }

    // Caso base: Se a lista geral estiver vazia (sem busca)
    if (listaParaExibir.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:80px 20px; opacity:0.6;">
                <i class="fa-solid fa-layer-group" style="font-size:3rem; margin-bottom:20px; display:block;"></i>
                <p>Nenhuma análise sincronizada no momento.</p>
            </div>`;
        renderizarBotaoPaginacao(false);
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
                <div class="destaque-categoria" onclick="if(window.analises) window.analises.abrirNoModalGlobal('${news.id}')">
                    <i class="fa-solid fa-hashtag"></i> ${news.categoria || 'ANÁLISE'}
                </div>
                <div class="destaque-data-badge">
                    <i class="fa-regular fa-clock"></i> ${news.tempoLeitura || '5 min'}
                </div>
            </div>
            
            <div class="destaque-header">
              <h2 class="destaque-titulo" onclick="if(window.analises) window.analises.abrirNoModalGlobal('${news.id}')">
                ${news.titulo}
              </h2>
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
            <button class="btn-premium-icon" onclick="if(window.analises) window.analises.compartilharNoticia('${news.titulo.replace(/'/g, "\\'")}', '${shareUrl}')">
              <i class="fa-solid fa-share-nodes"></i> 
              <span>Compartilhar</span>
            </button>
            <div class="stats-group">
                <i class="fa-solid fa-chart-line"></i>
                <span class="stats-num">${viewCount} visualizações</span>
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

          <div class="comments-trigger-bar">
            <div class="trigger-left" style="display: flex; align-items: center; gap: 10px; color: var(--tema-cor); font-weight: 700; font-size: 0.85rem;">
              <i class="fa-solid fa-circle-nodes"></i>
              <span>Ver discussão da comunidade...</span>
            </div>
            <div class="trigger-right" style="color: var(--text-muted); font-size: 1.1rem;">
                <i class="fa-solid fa-comments"></i>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Se houver mais notícias além do limite, mostra o botão. Se for busca com poucos resultados, oculta.
    const totalDisponivel = noticias.length;
    renderizarBotaoPaginacao(totalDisponivel > limite);
}
