/**
 * ARQUIVO: scripts/navegacao.js
 * PAPEL: Orquestrador Dinâmico Universal
 * VERSÃO: 6.0.0 - Suporte a Novos Módulos Infinitos
 */

// ... (Início igual até a função carregarSecao)

    async function carregarSecao(nome) {
        if (!displayPrincipal || secaoAtiva === nome) return;

        updateProgress(30); 
        executarLimpezaModuloAnterior();
        
        secaoAtiva = nome;
        window.inicializarSecao = null;

        try {
            updateProgress(60); 
            
            // 🛡️ PADRÃO UNIVERSAL DE PASTA: modulos/modulos_nome/nome.html
            const pastaModulo = `modulos_${nome}`;
            const urlHtml = `./modulos/${pastaModulo}/${nome}.html`;
            
            const response = await fetch(urlHtml);
            if (!response.ok) throw new Error(`Módulo ${nome} não encontrado em ${urlHtml}`);
            
            const htmlBase = await response.text();
            displayPrincipal.innerHTML = htmlBase;

            const scriptId = `script-modulo-ativo`;
            document.getElementById(scriptId)?.remove();

            const novoScript = document.createElement("script");
            novoScript.id = scriptId;
            novoScript.type = "module";
            
            // 🛡️ CARREGAMENTO DINÂMICO DE SCRIPT
            novoScript.src = `./modulos/${pastaModulo}/${nome}_principal.js?v=${Date.now()}`;
            
            novoScript.onload = () => {
                if (typeof window.inicializarSecao === 'function') {
                    window.inicializarSecao(displayPrincipal, { modo: 'lista', origem: nome });
                    updateProgress(100);
                }
            };

            document.body.appendChild(novoScript);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            updateProgress(0);
            console.error("Erro de Navegação:", err);
            displayPrincipal.innerHTML = `<div style="text-align:center; padding:100px;">
                <h2>Erro de Conexão</h2>
                <p>O módulo <b>${nome}</b> não pôde ser carregado.</p>
            </div>`;
        }
    }

    /**
     * EVENTOS DE NAVEGAÇÃO AUTOMÁTICOS
     * Agora o script não checa mais uma lista, ele checa apenas se o atributo data-section existe.
     */
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-section]');
        
        if (link) {
            e.preventDefault();
            const secaoId = link.dataset.section.trim().toLowerCase();
            
            if (secaoId) {
                carregarSecao(secaoId);
                // Prefetch opcional ao clicar para garantir cache
                prefetchSecao(secaoId); 
            }
        }
    });

    // Prefetch automático ao passar o mouse em qualquer item com data-section
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('[data-section]');
        if (link) {
            prefetchSecao(link.dataset.section.trim().toLowerCase());
        }
    });

// ... (Restante do código igual)
