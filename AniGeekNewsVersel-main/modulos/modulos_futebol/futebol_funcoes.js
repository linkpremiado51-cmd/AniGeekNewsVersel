/**
 * ARQUIVO: modulos/modulos_futebol/futebol_funcoes.js
 * PAPEL: Funções utilitárias e suporte visual para o Módulo Futebol
 * VERSÃO: 1.0 - Otimizado para Transmissões e Embeds
 */

/**
 * Remove espaços extras de strings (Utilizado para tratar URLs do Firebase)
 */
export function limparEspacos(texto) {
    return (texto && typeof texto === 'string') ? texto.trim() : texto;
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
            setTimeout(() => {
                if (document.getElementById('toast-copiado')) {
                    toast.classList.remove('mostrar');
                }
            }, 2500);
        }
    } catch (err) {
        console.error("[Futebol Util] Erro ao copiar link:", err);
    }
}

/**
 * Aciona o compartilhamento nativo ou fallback para cópia
 */
export function compartilharNoticia(titulo, url) {
    const shareData = { title: titulo, url: url };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(err => {
            if (err.name !== 'AbortError') console.error("[Futebol Util] Share:", err);
        });
    } else {
        copiarLink(url);
    }
}

/**
 * Altera o SRC do player de vídeo (Troca de lances/vídeos relacionados)
 * 🛠️ Otimizado para carregar lances de futebol com autoplay
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (!player || !idVideo) return;

    const params = "?autoplay=1&mute=0&modestbranding=1&rel=0";
    let novoSrc = idVideo;

    // Converte ID simples em URL de Embed Oficial
    if (!idVideo.includes('http')) {
        novoSrc = `https://www.youtube.com/embed/${idVideo}`;
    } else if (idVideo.includes('watch?v=')) {
        novoSrc = idVideo.replace('watch?v=', 'embed/');
    }

    // Aplica o novo vídeo com os parâmetros de player profissional
    player.src = novoSrc.includes('?') ? `${novoSrc}&autoplay=1` : novoSrc + params;
}

/**
 * Gerencia o fechamento do modal e limpa a URL (ID da notícia de futebol)
 */
export function fecharModalPrincipal() {
    if (typeof window.fecharModalNoticia === 'function') {
        window.fecharModalNoticia();
    } else {
        const modal = document.getElementById('modal-noticia-global');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = ''; 
    }
    
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('id')) {
            url.searchParams.delete('id');
            window.history.replaceState({}, document.title, url.pathname + url.search);
        }
    } catch (e) {
        console.warn("[Futebol Util] Falha ao limpar URL de estado.");
    }
}
