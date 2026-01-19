/* ======================================================
   scripts/busca.js
   PAPEL: Infraestrutura de Busca (EVENT-DRIVEN)
   NÃO renderiza UI
   NÃO acessa dados
====================================================== */

const inputBusca = document.getElementById('input-busca-global');
let timeoutBusca = null;

if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(timeoutBusca);

        const termo = e.target.value
            .toLowerCase()
            .trim();

        // Busca vazia = notifica limpeza
        if (!termo) {
            window.dispatchEvent(new CustomEvent('busca:limpar'));
            return;
        }

        timeoutBusca = setTimeout(() => {
            console.log(`🔍 Evento de busca emitido: "${termo}"`);

            window.dispatchEvent(
                new CustomEvent('busca:termo', {
                    detail: { termo }
                })
            );
        }, 250);
    });
}

/**
 * API pública para limpar a busca externamente
 */
window.limparBuscaGlobal = function () {
    if (!inputBusca) return;
    inputBusca.value = '';
    window.dispatchEvent(new CustomEvent('busca:limpar'));
};
