/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 4.1 - Ajustado para Navegação no Modal Global
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let noticiasExibidasCount = 5;

// Fallback para log caso a função global não exista
const log = (msg) => window.logVisual ? window.logVisual(msg) : console.log(`[Análises]: ${msg}`);

// --- CONTRATO DE INICIALIZAÇÃO (Exigido pelo navegacao.js) ---
window.inicializarSecao = function(containerRoot, contexto) {
    log(`Módulo Análises iniciado em modo: ${contexto.modo}`);
    
    // Inicia a sincronização
    iniciarIntegracao();
    carregarBlocoEditorial();
};

/**
 * Interface de Ações do Módulo
 */
window.analises = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            // Passamos a notícia selecionada e a lista completa para o Modal Manager
            // permitindo que os botões "Anterior" e "Próxima" funcionem.
            window.abrirModalNoticia({
                ...noticia,
                lista: todasAsAnalisesLocais 
            });
        }
    },
    toggleComentarios: (abrir, id = null) => {
        if (window.secaoComentarios && typeof window.secaoComentarios.abrir === 'function') {
            if (abrir) window.secaoComentarios.abrir(id);
            else window.secaoComentarios.fechar();
        }
    },
    carregarMaisNovo: () => {
        const totalNoBanco = todasAsAnalisesLocais.length;
        if (noticiasExibidasCount >= totalNoBanco) {
            log(`Fim da lista de análises.`);
        } else {
            noticiasExibidasCount += 5;
            atualizarInterface();
        }
    }
};

/**
 * Delegação de Eventos
 */
document.addEventListener('click', (e) => {
    const btnMais = e.target.closest('#btn-carregar-mais');
    if (btnMais) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
    }

    const triggerComentarios = e.target.closest('.comments-trigger-bar');
    if (triggerComentarios) {
        const artigo = triggerComentarios.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) window.analises.toggleComentarios(true, idNoticia);
    }
});

function atualizarInterface() {
    Interface.renderizarNoticias(todasAsAnalisesLocais, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao();
}

function iniciarIntegracao() {
    const filtrarEAtualizar = () => {
        if (window.noticiasFirebase) {
            todasAsAnalisesLocais = window.noticiasFirebase
                .filter(n => n.origem === 'analises')
                .sort((a, b) => (b.data || 0) - (a.data || 0));
            
            atualizarInterface();
        }
    };

    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
        filtrarEAtualizar();
    }

    // Escuta atualizações do Firebase via evento customizado ou polling do config-firebase
    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
    
    // Fallback: Se o firebase-config não dispara evento, checamos em intervalo curto no início
    const checkData = setInterval(() => {
        if (todasAsAnalisesLocais.length === 0 && window.noticiasFirebase?.length > 0) {
            filtrarEAtualizar();
            clearInterval(checkData);
        }
    }, 500);
    setTimeout(() => clearInterval(checkData), 5000);
}

async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
    
    const descEl = document.getElementById('capa-descricao');
    if (descEl) descEl.textContent = "Críticas técnicas, teorias e opiniões sobre os maiores lançamentos.";
}

log("Módulo de Análises Pronto.");
