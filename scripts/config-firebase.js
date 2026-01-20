/* ======================================================
   scripts/busca.js
   PAPEL: Motor de Busca com Gaveta de Sugestões Integrada
   VERSÃO: 7.0 - Filtro Real-Time via window.noticiasFirebase
====================================================== */

const inputBusca = document.getElementById('input-busca-global');
const surfaceBusca = document.getElementById('search-results-surface');
const drawerSugestoes = document.getElementById('search-suggestions-drawer');

let timeoutBusca = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);

        const termo = e.target.value.toLowerCase().trim();

        if (!termo) {
            limparTudo();
            return;
        }

        // Mostra a gaveta imediatamente
        if (drawerSugestoes) drawerSugestoes.classList.add('active');

        timeoutBusca = setTimeout(() => {
            processarBuscaIntegrada(termo);
        }, 300);
    });
}

/**
 * Processa a filtragem dos dados e renderiza as duas interfaces
 */
function processarBuscaIntegrada(termo) {
    if (!window.noticiasFirebase) return;

    // 1. Filtra os dados no array global do Firebase
    const resultados = window.noticiasFirebase.filter(noticia => {
        const titulo = (noticia.titulo || "").toLowerCase();
        const sub = (noticia.subtitulo || "").toLowerCase();
        return titulo.includes(termo) || sub.includes(termo);
    });

    // 2. Renderiza a Gaveta de Sugestões (Apenas Títulos Rápidos)
    renderizarGaveta(resultados.slice(0, 6)); // Mostra as 6 primeiras sugestões

    // 3. Notifica o Surface (Resultados Principais/Cards)
    if (surfaceBusca) {
        window.dispatchEvent(new CustomEvent('busca:termo', { detail: { termo } }));
    }
}

/**
 * Cria os itens da lista suspensa (Gaveta)
 */
function renderizarGaveta(sugestoes) {
    if (!drawerSugestoes) return;

    if (sugestoes.length === 0) {
        drawerSugestoes.innerHTML = `
            <div class="suggestion-item">
                <i class="fa-solid fa-face-frown"></i>
                <div class="suggestion-info">
                    <span class="suggestion-title">Nenhum resultado rápido encontrado</span>
                </div>
            </div>`;
        return;
    }

    drawerSugestoes.innerHTML = sugestoes.map(item => `
        <div class="suggestion-item" onclick="abrirPelaSugestao('${item.id}')">
            <i class="fa-solid fa-bolt"></i>
            <div class="suggestion-info">
                <span class="suggestion-title">${item.titulo}</span>
                <span class="suggestion-category">${item.origem || 'Destaque'}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Função para abrir a notícia ao clicar na sugestão
 */
window.abrirPelaSugestao = function(id) {
    const noticia = window.noticiasFirebase.find(n => n.id === id);
    if (noticia && typeof window.abrirModalNoticia === 'function') {
        window.abrirModalNoticia(noticia);
        limparTudo();
    }
};

function limparTudo() {
    if (inputBusca) inputBusca.value = '';
    if (drawerSugestoes) {
        drawerSugestoes.classList.remove('active');
        drawerSugestoes.innerHTML = '';
    }
    if (surfaceBusca) {
        surfaceBusca.innerHTML = '';
        surfaceBusca.style.display = 'none';
    }
    window.dispatchEvent(new CustomEvent('busca:limpar'));
}

window.limparBuscaGlobal = limparTudo;

// Fecha a gaveta se clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar-wrapper')) {
        if (drawerSugestoes) drawerSugestoes.classList.remove('active');
    }
});
