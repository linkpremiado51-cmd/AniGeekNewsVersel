/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * PAPEL: Controle de Visibilidade e UI do Modal
 * VERSÃO: 6.1 - Fechamento Forçado (Correção Pós-Diagnóstico)
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

        // 1. Estado Inicial Forçado
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.pointerEvents = 'auto'; // Garante que receba cliques
        
        // 2. Reflow
        void modal.offsetWidth; 

        // 3. Ativação
        modal.classList.add('active');
        
        // Trava o scroll global
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden'; 

    } else {
        if (window.logVisual) window.logVisual("[UI] Fechando...");
        
        // 1. Remove a classe active e mata os eventos de ponteiro imediatamente
        modal.classList.remove('active');
        modal.style.pointerEvents = 'none';

        // 2. Libera o scroll global NA HORA
        document.documentElement.style.overflow = '';
        document.body.style.overflow = ''; 

        // 3. Desligamento Atômico
        // Usamos display 'none' após um tempo mínimo apenas para a transição
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.setProperty('display', 'none', 'important');
                modal.style.visibility = 'hidden';
                modal.dataset.idAtual = ""; 
                if (window.logVisual) window.logVisual("🌑 Modal fechado com sucesso.");
            }
        }, 100); // 100ms é imperceptível mas suficiente para o navegador processar
    }
}

/**
 * Limpa o campo de texto
 */
export function limparCampoInput() {
    const input = document.getElementById('input-novo-comentario');
    if (input) {
        input.value = '';
        input.blur(); 
    }
}
