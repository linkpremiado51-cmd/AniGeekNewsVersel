/* ======================================================
   scripts/busca.js
   PAPEL: Infraestrutura de Busca com Gaveta de Sugestões
   VERSÃO: 6.0 - Sistema de Sugestões em Tempo Real
====================================================== */

const inputBusca = document.getElementById('input-busca-global');
const surfaceBusca = document.getElementById('search-results-surface');
// 🛡️ Nova referência para a gaveta de sugestões
const drawerSugestoes = document.getElementById('search-suggestions-drawer');

let timeoutBusca = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);

        const termo = e.target.value.toLowerCase().trim();

        if (!termo) {
            fecharGaveta();
            if (surfaceBusca) {
                surfaceBusca.innerHTML = '';
                surfaceBusca.style.display = 'none';
            }
            window.dispatchEvent(new CustomEvent('busca:limpar'));
            return;
        }

        // 1. Mostrar a gaveta imediatamente com um "carregando"
        abrirGaveta(termo);

        timeoutBusca = setTimeout(() => {
            if (window.logVisual) window.logVisual(`🔍 Buscando: "${termo}"`);

            // 2. Emite o evento para o motor processar (Feed Principal)
            window.dispatchEvent(
                new CustomEvent('busca:termo', {
                    detail: { termo }
                })
            );
            
            // 3. Emite um evento específico para as sugestões da gaveta
            window.dispatchEvent(
                new CustomEvent('busca:sugestoes', {
                    detail: { termo }
                })
            );
        }, 300);
    });
}

function abrirGaveta(termo) {
    if (!drawerSugestoes) return;
    drawerSugestoes.classList.add('active');
    // Você pode colocar um loader inicial aqui se desejar
}

function fecharGaveta() {
    if (!drawerSugestoes) return;
    drawerSugestoes.classList.remove('active');
    drawerSugestoes.innerHTML = ''; 
}

/**
 * API pública para limpar a busca externamente
 */
window.limparBuscaGlobal = function () {
    if (!inputBusca) return;
    inputBusca.value = '';
    fecharGaveta();
    if (surfaceBusca) {
        surfaceBusca.innerHTML = '';
        surfaceBusca.style.display = 'none';
    }
    window.dispatchEvent(new CustomEvent('busca:limpar'));
};
