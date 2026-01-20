/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * PAPEL: Controle de Visibilidade e UI do Modal
 * VERSÃO: 6.0 - Fechamento Atômico (Anti-Glitch Mobile)
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

        // 1. Força o estado inicial
        modal.style.display = 'flex';
        modal.style.opacity = '0';
        
        // 2. Reflow
        void modal.offsetWidth; 

        // 3. Ativa
        modal.classList.add('active');
        modal.style.opacity = '1';
        
        // Trava o scroll do site ao fundo
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden'; 

    } else {
        if (window.logVisual) window.logVisual("[UI] Fechando...");
        
        // 1. Remove classes de estado IMEDIATAMENTE
        modal.classList.remove('active');
        modal.style.opacity = '0';

        // 2. Libera o scroll IMEDIATAMENTE (Não espera o timer)
        document.documentElement.style.overflow = '';
        document.body.style.overflow = ''; 

        // 3. O "Golpe de Misericórdia": 
        // Em vez de esperar 300ms, vamos garantir que ele suma da árvore de renderização
        // Mas damos 150ms apenas para o olho humano ver a saída
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                modal.dataset.idAtual = ""; 
                if (window.logVisual) window.logVisual("🌑 Modal destruído visualmente.");
            }
        }, 150); 
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
