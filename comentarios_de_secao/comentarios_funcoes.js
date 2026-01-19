/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * PAPEL: Controle de Visibilidade e UI do Modal
 * VERSÃO: 5.2 - Otimizado para Performance Mobile
 */

/**
 * Controla a exibição do modal de comentários com verificação de estado
 */
export function toggleComentarios(abrir = true, idConteudo = null) {
    const modal = document.getElementById('modal-comentarios-global');
    
    if (!modal) {
        if (window.logVisual) window.logVisual("❌ Erro: Modal não encontrado.");
        return;
    }

    if (abrir) {
        if (window.logVisual) window.logVisual(`[UI] Abrindo modal...`);
        
        if (idConteudo) {
            modal.dataset.idAtual = idConteudo;
        }

        // Prepara o display
        modal.style.display = 'flex';
        
        // Força o reflow para garantir que a animação CSS ocorra
        void modal.offsetWidth; 

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 

        if (window.logVisual) window.logVisual("✨ Interface pronta.");
    } else {
        if (window.logVisual) window.logVisual("[UI] Fechando...");
        
        modal.classList.remove('active');
        
        // Aguarda a transição do CSS (0.3s) antes de remover o display flex
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                modal.dataset.idAtual = ""; 
                if (window.logVisual) window.logVisual("🌑 Modal fechado.");
            }
        }, 350);
        
        document.body.style.overflow = 'auto';
    }
}

/**
 * Limpa o campo de texto após o envio bem-sucedido
 */
export function limparCampoInput() {
    const input = document.getElementById('input-novo-comentario');
    if (input) {
        input.value = '';
        // No mobile, o focus pode abrir o teclado sem querer, 
        // então removemos o foco após limpar se necessário.
        input.blur(); 
    }
}
