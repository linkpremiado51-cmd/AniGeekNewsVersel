/**
 * ARQUIVO: modulos/modulos_futebol/futebol_principal.js
 * PAPEL: Módulo de Futebol Profissional (Orquestrador)
 * VERSÃO: 9.0 - Sincronização Cromática e Gestão de Ciclo de Vida
 */

import * as Funcoes from './futebol_funcoes.js';
import * as Interface from './futebol_interface.js';

// 1. CONTRATO DE EVENTOS
const EVENTS = {
    BUSCA_TERMO: 'busca:termo',
    BUSCA_LIMPAR: 'busca:limpar',
    FIREBASE_DATA: 'firebase:data_updated'
};

// 2. ESTADO CRÍTICO MÍNIMO
let state = {
    todas: [],
    filtradas: [],
    exibidasCount: 5,
    termoAtivo: "",
    isInitialized: false 
};

const log = (msg) => window.logVisual ? window.logVisual(`[Futebol]: ${msg}`) : console.log(`[Futebol]: ${msg}`);

/**
 * INICIALIZAÇÃO FORMAL (SPA Contract)
 */
window.inicializarSecao = function(containerRoot, contexto) {
    if (state.isInitialized) {
        window.desmontarSecao(); 
    }

    log(`Estádio Virtual pronto.`);
    
    configurarEscutas(); 
    iniciarIntegracaoFirebase();
    
    // UI: Garantia de topo e escuta de cliques
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.addEventListener('click', gerenciarCliquesLocais);
    
    state.isInitialized = true;
};

/**
 * DESMONTAGEM (Clean Up)
 */
window.desmontarSecao = function() {
    log(`Limpando arquibancada...`);
    
    window.removeEventListener(EVENTS.BUSCA_TERMO, tratarEventoBusca);
    window.removeEventListener(EVENTS.BUSCA_LIMPAR, tratarLimpezaBusca);
    window.removeEventListener(EVENTS.FIREBASE_DATA, filtrarEAtualizar);
    document.removeEventListener('click', gerenciarCliquesLocais);
    
    if (window.secaoComentarios) window.secaoComentarios.fechar();

    // Reset de estado
    state.todas = [];
    state.filtradas = [];
    state.termoAtivo = "";
    state.isInitialized = false;
};

/**
 * API DO MÓDULO
 */
window.futebol = {
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
                window.scrollBy({ top: 350, behavior: 'smooth' });
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
        // Ponto 9: Filtragem por origem 'futebol'
        state.todas = window.noticiasFirebase
            .filter(n => n.origem === 'futebol')
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
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
    
    // Ponto 9: Interface injeta as notícias no container específico do futebol.html
    Interface.renderizarNoticias(dadosParaExibir, state.exibidasCount);
    Interface.renderizarBotaoPaginacao(dadosParaExibir.length, state.exibidasCount);
}

function gerenciarCliquesLocais(e) {
    const target = e.target;

    // Detecta o botão de paginação que configuramos no futebol.html
    const btnMais = target.closest('.btn-paginacao-futebol') || target.closest('#futebol-pagination-modulo button');
    if (btnMais) {
        e.preventDefault();
        window.futebol.carregarMaisNovo();
        return;
    }

    // Gerenciamento de comentários integrado
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
