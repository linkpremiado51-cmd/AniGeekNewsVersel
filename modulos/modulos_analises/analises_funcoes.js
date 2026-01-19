/**
 * ARQUIVO: modulos/modulos_analises/analises_funcoes.js
 * PAPEL: Funções utilitárias e suporte visual otimizadas
 * VERSÃO: 4.2 - Correção de Embed e Sincronização de Modal
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
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(err => {
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

    const params = "?autoplay=1&mute=0&modestbranding=1&rel=0";
    let novoSrc = idVideo;

    // Lógica para transformar ID ou URL em Embed válido
    if (!idVideo.includes('http')) {
        // CORREÇÃO: Usando o domínio oficial do YouTube Embed
        novoSrc = `https://www.youtube.com/embed/${idVideo}`;
    } else if (idVideo.includes('watch?v=')) {
        novoSrc = idVideo.replace('watch?v=', 'embed/');
    }

    // Adiciona parâmetros de reprodução se não existirem
    player.src = novoSrc.includes('?') ? `${novoSrc}&autoplay=1` : novoSrc + params;
}

/**
 * Gerencia o fechamento do modal e limpa a URL (ID da notícia)
 */
export function fecharModalPrincipal() {
    // Prioriza a função global do modal-manager.js
    if (typeof window.fecharModalNoticia === 'function') {
        window.fecharModalNoticia();
    } else {
        const modal = document.getElementById('modal-noticia-global');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Limpeza da URL para manter o estado da SPA limpo
    const url = new URL(window.location);
    if (url.searchParams.has('id')) {
        url.searchParams.delete('id');
        // Remove o ID da barra de endereços sem recarregar a página
        window.history.pushState({}, '', url.pathname + url.search);
    }
}
