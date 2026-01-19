/**
 * ARQUIVO: comentarios_de_secao/comentarios_funcoes.js
 * PAPEL: Controle de Visibilidade e Persistência (Diagnóstico Mobile)
 * VERSÃO: 5.1 - Logs de Estado Visual
 */

import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Controla a exibição do modal de comentários com verificação de estado
 */
export function toggleComentarios(abrir = true, idConteudo = null) {
    const modal = document.getElementById('modal-comentarios-global');
    
    if (!modal) {
        if (window.logVisual) window.logVisual("❌ Erro: Modal não existe no DOM.");
        console.warn("Funções: Modal de comentários não encontrado.");
        return;
    }

    if (abrir) {
        if (window.logVisual) window.logVisual(`[UI] Ativando modal para: ${idConteudo}`);
        
        // Vincula o ID ao elemento para referência futura
        if (idConteudo) {
            modal.dataset.idAtual = idConteudo;
        }

        // Garante a exibição do bloco antes da animação
        modal.style.display = 'flex';
        
        // Força o reflow (necessário para alguns navegadores mobile processarem a transição)
        void modal.offsetWidth; 

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Trava o scroll do fundo

        if (window.logVisual) window.logVisual("✨ Modal visualmente ativo.");
    } else {
        if (window.logVisual) window.logVisual("[UI] Desativando modal.");
        
        modal.classList.remove('active');
        
        // Aguarda a transição do CSS antes de ocultar totalmente
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                modal.style.display = 'none';
                modal.dataset.idAtual = ""; 
                if (window.logVisual) window.logVisual("🌑 Modal ocultado.");
            }
        }, 300);
        
        document.body.style.overflow = 'auto';
    }
}

/**
 * Envia um novo comentário para o Firestore (Usado internamente pelo módulo principal)
 */
export async function enviarNovoComentario(db, idConteudo, texto) {
    if (!texto || !texto.trim()) {
        if (window.logVisual) window.logVisual("⚠️ Texto vazio.");
        return;
    }

    try {
        if (window.logVisual) window.logVisual("🚀 Gravando no Firestore...");
        
        const colRef = collection(db, "analises", idConteudo, "comentarios");
        await addDoc(colRef, {
            autor: window.AniGeekUser?.nome || "Usuário Geek",
            texto: texto.trim(),
            data: serverTimestamp()
        });

        if (window.logVisual) window.logVisual("✅ Sucesso ao gravar.");
        limparCampoInput();
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro no Firebase: " + error.message);
        console.error("Erro Firebase:", error);
    }
}

/**
 * Limpa o campo de texto após o envio
 */
export function limparCampoInput() {
    const input = document.getElementById('input-novo-comentario');
    if (input) {
        input.value = '';
        input.focus();
    }
}
