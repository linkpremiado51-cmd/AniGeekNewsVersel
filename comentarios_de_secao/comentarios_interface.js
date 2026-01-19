/**
 * ARQUIVO: comentarios_de_secao/comentarios_interface.js
 * PAPEL: Gerador de Interface Dinâmica para o Módulo de Comentários
 * VERSÃO: 5.0 - IDs Padronizados e Injeção Limpa
 */

/**
 * Cria a estrutura base do modal no DOM se ela não existir.
 * Esta estrutura é injetada uma única vez no index.html pelo script principal.
 */
export function injetarEstruturaModal() {
    // Evita duplicatas no DOM
    if (document.getElementById('modal-comentarios-global')) return;

    const modalHTML = `
        <div id="modal-comentarios-global" class="modal-comentarios-overlay">
            <div class="modal-comentarios-content">
                <div class="comentarios-header">
                    <div class="header-label">
                        <i class="fa-solid fa-comments" style="color: #8A2BE2;"></i>
                        <span style="margin-left:8px; font-weight:bold;">Comunidade</span>
                        <small id="comentarios-subtitulo" style="display:block; opacity:0.6; font-size:10px;">Discussão Ativa</small>
                    </div>
                    <button id="btn-fechar-comentarios" class="btn-close-comentarios">&times;</button>
                </div>
                
                <div id="lista-comentarios-fluxo" class="comentarios-body">
                    <p style="text-align:center; padding:20px; opacity:0.5;">Carregando mensagens...</p>
                </div>

                <div class="comentarios-footer">
                    <div class="input-container-global">
                        <input type="text" id="input-novo-comentario" placeholder="Escreva algo..." autocomplete="off">
                        <button id="btn-enviar-global" class="btn-enviar-comentario">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (window.logVisual) window.logVisual("Interface: Modal Global injetado no Body.");
}

/**
 * Gera o HTML de um único balão de comentário com suporte a cores e avatares
 */
export function criarBalaoComentario(autor, texto) {
    const nomeExibicao = autor || "Anônimo";
    const letra = nomeExibicao.charAt(0).toUpperCase();
    
    return `
        <div class="comentario-item">
            <div class="comentario-avatar">
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

    // Caso não existam comentários
    if (!comentarios || comentarios.length === 0) {
        listaContainer.innerHTML = `
            <div style="text-align:center; padding:40px 20px; opacity:0.5;">
                <i class="fa-solid fa-comments" style="font-size:2rem; margin-bottom:10px; display:block; color: #8A2BE2;"></i>
                <p style="font-size:0.9rem;">Nenhum comentário ainda.<br>Seja o primeiro a participar!</p>
            </div>`;
        return;
    }

    // Renderiza a lista mapeando os campos possíveis do Firebase
    listaContainer.innerHTML = comentarios.map(c => {
        const autor = c.autor || c.nome || c.usuario || "Anônimo";
        const texto = c.texto || c.comentario || "";
        return criarBalaoComentario(autor, texto);
    }).join('');

    // Rola suavemente para o final da conversa
    setTimeout(() => {
        listaContainer.scrollTo({ 
            top: listaContainer.scrollHeight, 
            behavior: 'smooth' 
        });
    }, 100);
}
