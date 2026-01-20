/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * PAPEL: Controle de Visibilidade e UI do Modal
 * VERSÃO: 5.3 - Ajuste de Resiliência no Fechamento
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

        // Garante que o display esteja ativo antes da classe active
        modal.style.display = 'flex';
        
        // Força o reflow para garantir que a animação CSS ocorra
        void modal.offsetWidth; 

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 

        if (window.logVisual) window.logVisual("✨ Interface pronta.");
    } else {
        if (window.logVisual) window.logVisual("[UI] Fechando...");
        
        // Remove a classe de animação primeiro
        modal.classList.remove('active');
        
        // Reset imediato do scroll do corpo para evitar travamentos
        document.body.style.overflow = ''; 

        // Aguarda a transição do CSS (0.3s) e força o sumiço
        setTimeout(() => {
            // Se o modal ainda não foi reaberto nesse meio tempo, escondemos
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                modal.dataset.idAtual = ""; 
                if (window.logVisual) window.logVisual("🌑 Modal fechado.");
            }
        }, 300); // Reduzido para 300ms para ser mais responsivo
    }
}

/**
 * Limpa o campo de texto após o envio bem-sucedido
 */
export function limparCampoInput() {
    const input = document.getElementById('input-novo-comentario');
    if (input) {
        input.value = '';
        input.blur(); 
    }
}
