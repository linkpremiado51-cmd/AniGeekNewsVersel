/**
 * ARQUIVO: scripts/busca.js
 * PAPEL: Infraestrutura de Busca (EVENT-DRIVEN)
 * VERSÃO: 6.0 - Integração com Ciclo de Vida SPA
 */

const inputBusca = document.getElementById('input-busca-global');
const surfaceBusca = document.getElementById('search-results-surface');
const suggestionsDrawer = document.getElementById('search-suggestions-drawer');
let timeoutBusca = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);

        const termo = e.target.value
            .toLowerCase()
            .trim();

        // 🛡️ Busca vazia: limpa a interface e notifica os módulos
        if (!termo) {
            fecharInterfacesBusca();
            window.dispatchEvent(new CustomEvent('busca:limpar'));
            return;
        }

        timeoutBusca = setTimeout(() => {
            if (window.logVisual) window.logVisual(`🔍 Buscando: "${termo}"`);

            // Emite o evento global que os módulos ativos (como analises_principal.js) escutam
            window.dispatchEvent(
                new CustomEvent('busca:termo', {
                    detail: { termo }
                })
            );
        }, 350); // Debounce levemente aumentado para estabilidade
    });

    // 🛡️ Fecha sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!inputBusca.contains(e.target) && !suggestionsDrawer?.contains(e.target)) {
            if (suggestionsDrawer) suggestionsDrawer.classList.remove('active');
        }
    });
}

/**
 * Limpa visualmente os containers de busca
 */
function fecharInterfacesBusca() {
    if (surfaceBusca) {
        surfaceBusca.innerHTML = '';
        surfaceBusca.style.display = 'none';
    }
    if (suggestionsDrawer) {
        suggestionsDrawer.innerHTML = '';
        suggestionsDrawer.classList.remove('active');
    }
}

/**
 * API pública para limpar a busca externamente
 */
window.limparBuscaGlobal = function () {
    if (!inputBusca) return;
    inputBusca.value = '';
    fecharInterfacesBusca();
    window.dispatchEvent(new CustomEvent('busca:limpar'));
};

/**
 * 🛡️ ESCUTADOR DE NAVEGAÇÃO
 * Quando o usuário troca de seção, a busca deve ser resetada para evitar conflitos de contexto.
 */
window.addEventListener('click', (e) => {
    const linkNavegacao = e.target.closest('.nav-item a') || e.target.closest('.filter-tag');
    if (linkNavegacao) {
        // Se mudou de aba, limpa o input e reseta os filtros de busca
        window.limparBuscaGlobal();
    }
});
