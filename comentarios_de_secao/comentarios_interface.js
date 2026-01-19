/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * PAPEL: Gerador de Interface Dinâmica para o Módulo de Comentários
 * VERSÃO: 5.1 - Ajustes de UX Mobile e Títulos Dinâmicos
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
                        <span id="comentarios-titulo-principal" style="margin-left:8px; font-weight:bold;">Comunidade</span>
                        <small id="comentarios-subtitulo" style="display:block; opacity:0.6; font-size:10px;">Discussão em tempo real</small>
                    </div>
                    <button id="btn-fechar-comentarios" class="btn-close-comentarios" aria-label="Fechar">&times;</button>
                </div>
                
                <div id="lista-comentarios-fluxo" class="comentarios-body">
                    <div style="text-align:center; padding:40px 20px;">
                        <i class="fa-solid fa-spinner fa-spin" style="color:#8A2BE2; font-size:1.5rem;"></i>
                        <p style="margin-top:10px; opacity:0.5; font-size:12px;">Conectando ao servidor...</p>
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
    if (window.logVisual) window.logVisual("Interface: Modal injetado com sucesso.");
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
            <div style="text-align:center; padding:60px 20px; opacity:0.3;">
                <i class="fa-solid fa-comments-slash" style="font-size:2.5rem; margin-bottom:15px; display:block;"></i>
                <p style="font-size:0.85rem; font-weight:700;">Ainda não há mensagens aqui.<br>Inicie a discussão!</p>
            </div>`;
        return;
    }

    // Renderiza a lista
    listaContainer.innerHTML = comentarios.map(c => {
        const autor = c.autor || "Anônimo";
        const texto = c.texto || "";
        return criarBalaoComentario(autor, texto);
    }).join('');

    // Rola para o final da conversa (Ajustado para mobile)
    setTimeout(() => {
        listaContainer.scrollTo({ 
            top: listaContainer.scrollHeight, 
            behavior: 'smooth' 
        });
    }, 150);
}
