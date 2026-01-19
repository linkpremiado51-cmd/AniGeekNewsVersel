/**
 * ARQUIVO: modulos/modulos_analises/analises_funcoes.js
 * PAPEL: Funções utilitárias e suporte visual otimizadas
 * VERSÃO: 4.1 - Ajuste de Protocolo e Integração SPA
 */

/**
 * Remove espaços extras de strings
 */
export function limparEspacos(texto) {
    return texto ? texto.trim() : texto;
}

/**
 * Gerencia o sistema de cópia com feedback visual (Toast)
 */
export async function copiarLink(url) {
    try {
        await navigator.clipboard.writeText(url);
        const toast = document.getElementById('toast-copiado');
        if (toast) {
            toast.classList.add('mostrar');
            setTimeout(() => toast.classList.remove('mostrar'), 2500);
        }
    } catch (err) {
        console.error("Erro ao copiar link:", err);
    }
}

/**
 * Aciona o compartilhamento nativo ou fallback para cópia
 */
export function compartilharNoticia(titulo, url) {
    const shareData = { title: titulo, url: url };
    
    // Verifica se o navegador suporta o compartilhamento nativo
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(err => {
            // Ignora erro se o usuário apenas cancelou o compartilhamento
            if (err.name !== 'AbortError') console.error(err);
        });
    } else {
        copiarLink(url);
    }
}

/**
 * Altera o SRC de um iframe de vídeo de forma dinâmica
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (!player || !idVideo) return;

    // Parâmetros para melhor UX no YouTube
    const params = "?autoplay=1&mute=0&modestbranding=1&rel=0";
    
    let novoSrc = idVideo;

    // Lógica para transformar ID simples em URL de Embed
    if (!idVideo.includes('http')) {
        // AJUSTE: Usando o padrão oficial de embed para evitar bloqueios de segurança
        novoSrc = `https://www.youtube.com/embed/${idVideo}`;
    }

    // Adiciona parâmetros de reprodução
    player.src = novoSrc.includes('?') ? `${novoSrc}&autoplay=1` : novoSrc + params;
    
    if (typeof window.logVisual === 'function') {
        window.logVisual(`Vídeo atualizado: ${idVideo}`);
    }
}

/**
 * Gerencia o fechamento do modal e limpa a URL (ID da notícia)
 */
export function fecharModalPrincipal() {
    // Sincronizado com o modal-manager.js que já temos no projeto
    if (window.fecharModalNoticia) {
        window.fecharModalNoticia();
    } else {
        const modal = document.getElementById('modal-noticia-global');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Notifica o orquestrador (navegacao.js) para resetar a trava de segurança
    if (typeof window.notificarModalFechado === 'function') {
        window.notificarModalFechado();
    }

    // Limpeza da URL
    const url = new URL(window.location);
    if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        window.history.pushState({}, '', url.pathname + url.search);
    }
}
