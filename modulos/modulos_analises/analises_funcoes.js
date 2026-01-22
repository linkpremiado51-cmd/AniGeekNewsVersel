/**
 * ARQUIVO: modulos/modulos_analises/analises_funcoes.js
 * PAPEL: Funções utilitárias e suporte visual otimizadas
 * VERSÃO: 5.0 - Fix Embed YouTube e Proteção de Estado de URL
 */

/**
 * Remove espaços extras de strings
 */
export function limparEspacos(texto) {
    return (texto && typeof texto === 'string') ? texto.trim() : texto;
}

/**
 * Gerencia o sistema de cópia com feedback visual (Toast)
 * 🛡️ Proteção: Verifica a existência do elemento antes de agir
 */
export async function copiarLink(url) {
    try {
        await navigator.clipboard.writeText(url);
        const toast = document.getElementById('toast-copiado');
        if (toast) {
            toast.classList.add('mostrar');
            setTimeout(() => {
                // Checagem extra: o elemento ainda existe no DOM?
                if (document.getElementById('toast-copiado')) {
                    toast.classList.remove('mostrar');
                }
            }, 2500);
        }
    } catch (err) {
        console.error("[Util] Erro ao copiar link:", err);
    }
}

/**
 * Aciona o compartilhamento nativo ou fallback para cópia
 */
export function compartilharNoticia(titulo, url) {
    const shareData = { title: titulo, url: url };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(err => {
            if (err.name !== 'AbortError') console.error("[Util] Share:", err);
        });
    } else {
        copiarLink(url);
    }
}

/**
 * Altera o SRC de um iframe de vídeo de forma dinâmica
 * 🛠️ CORREÇÃO: URL de Embed do YouTube corrigida para padrão oficial
 */
export function trocarVideo(idPlayer, idVideo) {
    const player = document.getElementById(idPlayer);
    if (!player || !idVideo) return;

    const params = "?autoplay=1&mute=0&modestbranding=1&rel=0";
    let novoSrc = idVideo;

    // Lógica para transformar ID ou URL em Embed válido
    if (!idVideo.includes('http')) {
        // CORREÇÃO: Usando o domínio oficial de embed do YouTube
        novoSrc = `https://www.youtube.com/embed/${idVideo}`;
    } else if (idVideo.includes('watch?v=')) {
        novoSrc = idVideo.replace('watch?v=', 'embed/');
    }

    // Adiciona parâmetros de reprodução se não existirem
    player.src = novoSrc.includes('?') ? `${novoSrc}&autoplay=1` : novoSrc + params;
}

/**
 * Gerencia o fechamento do modal e limpa a URL (ID da notícia)
 * 🛡️ Evolução: Limpeza de URL agora é resiliente ao roteamento
 */
export function fecharModalPrincipal() {
    // 1. Executa o fechamento visual
    if (typeof window.fecharModalNoticia === 'function') {
        window.fecharModalNoticia();
    } else {
        const modal = document.getElementById('modal-noticia-global');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = ''; // Reseta para o padrão
    }
    
    // 2. Limpeza da URL para manter o estado da SPA limpo
    // Utilizamos replaceState para não "sujar" o histórico de voltar do usuário
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('id')) {
            url.searchParams.delete('id');
            window.history.replaceState({}, document.title, url.pathname + url.search);
        }
    } catch (e) {
        console.warn("[Util] Falha ao limpar URL de estado.");
    }
}
