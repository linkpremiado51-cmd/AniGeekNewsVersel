/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * PAPEL: Gerador de Interface Dinâmica para o Módulo de Comentários
 * VERSÃO: 5.2 - Correção de UX no Botão Fechar (Hitbox Aumentada)
 */

/**
 * Cria a estrutura base do modal no DOM se ela não existir.
 */
export function injetarEstruturaModal() {
    if (document.getElementById('modal-comentarios-global')) return;

    const modalHTML = `
        <div id="modal-comentarios-global" class="modal-comentarios-overlay">
            <div class="modal-comentarios-content">
                <div class="comentarios-header">
                    <div class="header-label">
                        <i class="fa-solid fa-circle-nodes" style="color: #8A2BE2;"></i>
                        <div style="display: flex; flex-direction: column; margin-left: 10px;">
                            <span id="comentarios-titulo-principal" style="font-weight:900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Comunidade</span>
                            <small id="comentarios-subtitulo" style="opacity:0.6; font-size:10px; font-weight: 600;">Discussão em tempo real</small>
                        </div>
                    </div>
                    <button id="btn-fechar-comentarios" class="btn-close-comentarios modal-close-trigger" aria-label="Fechar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div id="lista-comentarios-fluxo" class="comentarios-body">
                    <div class="loader-comentarios" style="text-align:center; padding:60px 20px;">
                        <i class="fa-solid fa-spinner fa-spin" style="color:#8A2BE2; font-size:1.8rem;"></i>
                        <p style="margin-top:15px; opacity:0.6; font-size:11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Sincronizando mensagens...</p>
                    </div>
                </div>

                <div class="comentarios-footer">
                    <div class="input-container-global">
                        <input type="text" id="input-novo-comentario" placeholder="Escreva algo interessante..." autocomplete="off">
                        <button id="btn-enviar-global" class="btn-enviar-comentario">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.logVisual) window.logVisual("Interface: Modal injetado e pronto.");
}

/**
 * Gera o HTML de um único balão de comentário
 */
export function criarBalaoComentario(autor, texto) {
    const nomeExibicao = autor || "Leitor Geek";
    const letra = nomeExibicao.charAt(0).toUpperCase();
    
    return `
        <div class="comentario-item">
            <div class="comentario-avatar" style="background: var(--tema-cor, #8A2BE2)">
                ${letra}
            </div>
            <div class="comentario-texto-wrapper">
                <strong class="comentario-autor">${nomeExibicao}</strong>
                <p class="comentario-texto">${texto}</p>
            </div>
        </div>
    `;
}

/**
 * Recebe o array do Firebase e renderiza no container de fluxo
 */
export function renderizarListaComentarios(comentarios) {
    const listaContainer = document.getElementById('lista-comentarios-fluxo');
    if (!listaContainer) return;

    if (!comentarios || comentarios.length === 0) {
        listaContainer.innerHTML = `
            <div style="text-align:center; padding:80px 20px; opacity:0.3;">
                <i class="fa-solid fa-comments-slash" style="font-size:3rem; margin-bottom:15px; display:block;"></i>
                <p style="font-size:0.9rem; font-weight:800; text-transform: uppercase; letter-spacing: 1px;">Silêncio no set...<br>Seja o primeiro a comentar!</p>
            </div>`;
        return;
    }

    listaContainer.innerHTML = comentarios.map(c => {
        const autor = c.autor || "Anônimo";
        const texto = c.texto || "";
        return criarBalaoComentario(autor, texto);
    }).join('');

    // Rola para o final da conversa
    setTimeout(() => {
        listaContainer.scrollTo({ 
            top: listaContainer.scrollHeight, 
            behavior: 'smooth' 
        });
    }, 100);
}
