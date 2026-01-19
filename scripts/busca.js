/* ======================================================
   scripts/busca.js
   PAPEL: Infraestrutura de Busca (EVENT-DRIVEN)
   VERSÃO: 5.2 - Com Diagnóstico de Evento
====================================================== */

const inputBusca = document.getElementById('input-busca-global');
const surfaceBusca = document.getElementById('search-results-surface');
let timeoutBusca = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);

        const termo = e.target.value
            .toLowerCase()
            .trim();

        // Busca vazia = limpa a interface e notifica
        if (!termo) {
            if (surfaceBusca) {
                surfaceBusca.innerHTML = '';
                surfaceBusca.style.display = 'none';
            }
            window.dispatchEvent(new CustomEvent('busca:limpar'));
            return;
        }

        timeoutBusca = setTimeout(() => {
            if (window.logVisual) window.logVisual(`🔍 Buscando: "${termo}"`);

            // Emite o evento para o motor de busca processar
            window.dispatchEvent(
                new CustomEvent('busca:termo', {
                    detail: { termo }
                })
            );
        }, 300);
    });
}

/**
 * API pública para limpar a busca externamente
 */
window.limparBuscaGlobal = function () {
    if (!inputBusca) return;
    inputBusca.value = '';
    if (surfaceBusca) {
        surfaceBusca.innerHTML = '';
        surfaceBusca.style.display = 'none';
    }
    window.dispatchEvent(new CustomEvent('busca:limpar'));
};
