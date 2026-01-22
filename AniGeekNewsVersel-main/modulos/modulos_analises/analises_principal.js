/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas (Orquestrador)
 * VERSÃO: 9.0 - Integração SPA e Sincronização Cromática
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// 1. CONTRATO DE EVENTOS (Ponto 1)
const EVENTS = {
    BUSCA_TERMO: 'busca:termo',
    BUSCA_LIMPAR: 'busca:limpar',
    FIREBASE_DATA: 'firebase:data_updated'
};

// 2. ESTADO CRÍTICO MÍNIMO (Ponto 7)
let state = {
    todas: [],
    filtradas: [],
    exibidasCount: 5,
    termoAtivo: "",
    isInitialized: false 
};

const log = (msg) => window.logVisual ? window.logVisual(`[Análises]: ${msg}`) : console.log(`[Análises]: ${msg}`);

/**
 * INICIALIZAÇÃO FORMAL (Ponto 4 e 6)
 */
window.inicializarSecao = function(containerRoot, contexto) {
    // Garante que não haja duplicidade de listeners
    if (state.isInitialized) {
        window.desmontarSecao();
    }

    log(`Database Sincronizado.`);
    
    configurarEscutas(); 
    iniciarIntegracaoFirebase();
    
    // UI: Foco no topo da nova seção
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.addEventListener('click', gerenciarCliquesLocais);
    
    state.isInitialized = true;
};

/**
 * DESMONTAGEM (Clean-up de SPA)
 */
window.desmontarSecao = function() {
    log(`Liberando memória da seção...`);
    
    window.removeEventListener(EVENTS.BUSCA_TERMO, tratarEventoBusca);
    window.removeEventListener(EVENTS.BUSCA_LIMPAR, tratarLimpezaBusca);
    window.removeEventListener(EVENTS.FIREBASE_DATA, filtrarEAtualizar);
    document.removeEventListener('click', gerenciarCliquesLocais);
    
    if (window.secaoComentarios) window.secaoComentarios.fechar();

    // Reset total de estado
    state.todas = [];
    state.filtradas = [];
    state.termoAtivo = "";
    state.isInitialized = false;
};

/**
 * API DO MÓDULO (Ponto 10)
 */
window.analises = {
    ...Funcoes,
    
    abrirNoModalGlobal: (id) => {
        const noticia = state.todas.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia({ ...noticia, lista: state.todas });
        }
    },

    carregarMaisNovo: () => {
        const listaAtual = state.termoAtivo ? state.filtradas : state.todas;
        
        if (state.exibidasCount >= listaAtual.length) {
            log(`Fim dos resultados.`);
        } else {
            state.exibidasCount += 5;
            atualizarInterface();
            
            setTimeout(() => {
                window.scrollBy({ top: 300, behavior: 'smooth' });
            }, 100);
        }
    }
};

// --- LOGICA DE DADOS ---

function configurarEscutas() {
    window.addEventListener(EVENTS.BUSCA_TERMO, tratarEventoBusca);
    window.addEventListener(EVENTS.BUSCA_LIMPAR, tratarLimpezaBusca);
    window.addEventListener(EVENTS.FIREBASE_DATA, filtrarEAtualizar);
}

function filtrarEAtualizar() {
    if (window.noticiasFirebase) {
        // Filtra especificamente por origem 'analises'
        state.todas = window.noticiasFirebase
            .filter(n => n.origem === 'analises')
            .sort((a, b) => (b.timestamp || b.data || 0) - (a.timestamp || a.data || 0));
        
        if (state.termoAtivo) processarFiltro();
        else atualizarInterface();
    }
}

function tratarEventoBusca(e) {
    state.termoAtivo = e.detail.termo.toLowerCase();
    processarFiltro();
}

function tratarLimpezaBusca() {
    state.termoAtivo = "";
    processarFiltro();
}

function processarFiltro() {
    if (!state.termoAtivo) {
        state.filtradas = [];
    } else {
        state.filtradas = state.todas.filter(n => 
            (n.titulo && n.titulo.toLowerCase().includes(state.termoAtivo)) ||
            (n.resumo && n.resumo.toLowerCase().includes(state.termoAtivo))
        );
    }
    state.exibidasCount = 5; 
    atualizarInterface();
}

function atualizarInterface() {
    const dadosParaExibir = state.termoAtivo ? state.filtradas : state.todas;
    Interface.renderizarNoticias(dadosParaExibir, state.exibidasCount, state.termoAtivo);
    Interface.renderizarBotaoPaginacao(dadosParaExibir.length, state.exibidasCount);
}

function gerenciarCliquesLocais(e) {
    const target = e.target;

    // Detecta o botão de paginação específico do analises.html
    const btnMais = target.closest('.btn-paginacao-geek') || target.closest('#novo-pagination-modulo button');
    if (btnMais) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
        return;
    }

    // Gerenciador de comentários
    if (target.closest('.community-trigger-modern') || target.closest('.comments-trigger-bar')) {
        const artigo = target.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia && window.secaoComentarios) {
            window.secaoComentarios.abrir(idNoticia);
        }
    }
}

function iniciarIntegracaoFirebase() {
    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) {
        filtrarEAtualizar();
    }
}
