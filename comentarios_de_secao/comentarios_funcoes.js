/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * PAPEL: Controle de Visibilidade com Fechamento Atômico
 * VERSÃO: 6.5 - Kill Switch Instantâneo (Anti-Lag)
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

        // Força a exibição imediata
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.pointerEvents = 'auto';
        
        void modal.offsetWidth; 
        modal.classList.add('active');
        
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden'; 

    } else {
        // 🛡️ FECHAMENTO ATÔMICO: Mata o modal no exato milissegundo do clique
        if (window.logVisual) window.logVisual("[UI] Fechando instantaneamente...");
        
        // 1. Remove a classe de animação
        modal.classList.remove('active');

        // 2. CORREÇÃO CRÍTICA: Aplica display none NA HORA (sem setTimeout)
        // Isso impede que o modal fique "fantasma" ou embaçado na tela
        modal.style.setProperty('display', 'none', 'important');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.style.pointerEvents = 'none';

        // 3. Libera o scroll global imediatamente
        document.documentElement.style.overflow = '';
        document.body.style.overflow = ''; 
        
        modal.dataset.idAtual = ""; 
        
        if (window.logVisual) window.logVisual("🌑 Modal destruído visualmente.");
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
