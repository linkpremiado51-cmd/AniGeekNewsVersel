/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 6.1.0 - Sincronização Segura com Firebase (BUG FIX)
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let analisesFiltradas = [];
let noticiasExibidasCount = 5;
let termoBuscaAtivo = "";
let integracaoInicializada = false; // 🛡️ trava contra dupla inicialização

const log = (msg) =>
    window.logVisual ? window.logVisual(msg) : console.log(`[Análises]: ${msg}`);

/**
 * 🚀 INICIALIZAÇÃO DA SEÇÃO
 */
window.inicializarSecao = function (containerRoot, contexto) {

    // 🛑 BLOQUEIA inicialização sem dados
    if (!window.noticiasFirebase || window.noticiasFirebase.length === 0) {
        log("⏳ Aguardando dados do Firebase...");
        return;
    }

    if (integracaoInicializada) {
        log("⚠️ Inicialização já realizada, ignorando.");
        return;
    }

    integracaoInicializada = true;

    log("Módulo Análises iniciado.");

    configurarEscutaBusca();
    iniciarIntegracao();
    carregarBlocoEditorial();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.addEventListener('click', gerenciarCliquesLocais);
};

/**
 * 🧹 LIMPEZA COMPLETA DO MÓDULO
 */
window.desmontarSecao = function () {
    log("Limpando recursos...");

    integracaoInicializada = false;

    window.removeEventListener('busca:termo', tratarEventoBusca);
    window.removeEventListener('busca:limpar', tratarLimpezaBusca);
    window.removeEventListener('firebase:data_updated', filtrarEAtualizar);
    document.removeEventListener('click', gerenciarCliquesLocais);

    if (window.secaoComentarios) window.secaoComentarios.fechar();

    todasAsAnalisesLocais = [];
    analisesFiltradas = [];
    termoBuscaAtivo = "";
    noticiasExibidasCount = 5;
};

/**
 * 🌐 API PÚBLICA DO MÓDULO
 */
window.analises = {
    ...Funcoes,

    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia({ ...noticia, lista: todasAsAnalisesLocais });
        }
    },

    toggleComentarios: (abrir, id = null) => {
        if (!window.secaoComentarios) return;
        abrir ? window.secaoComentarios.abrir(id) : window.secaoComentarios.fechar();
    },

    carregarMaisNovo: () => {
        const listaAtual = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
        const totalDisponivel = listaAtual.length;

        if (noticiasExibidasCount >= totalDisponivel) {
            log("Fim dos resultados.");
            return;
        }

        noticiasExibidasCount += 5;
        atualizarInterface();

        setTimeout(() => {
            window.scrollBy({ top: 300, behavior: 'smooth' });
        }, 100);
    }
};

/**
 * 🔍 BUSCA
 */
function tratarEventoBusca(e) {
    termoBuscaAtivo = e.detail.termo.toLowerCase();
    processarFiltro();
}

function tratarLimpezaBusca() {
    termoBuscaAtivo = "";
    processarFiltro();
}

/**
 * 🖱️ CLIQUES INTERNOS
 */
function gerenciarCliquesLocais(e) {
    const target = e.target;

    const btnMais =
        target.closest('.btn-paginacao-geek') ||
        target.closest('.btn-carregar-mais');

    if (btnMais) {
        e.preventDefault();
        log("Botão carregar clicado.");
        window.analises.carregarMaisNovo();
        return;
    }

    if (
        target.closest('.comments-trigger-bar') &&
        !target.closest('[data-global-modal="true"]')
    ) {
        const artigo = target.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) window.analises.toggleComentarios(true, idNoticia);
    }
}

/**
 * 🔄 SINCRONIZAÇÃO COM FIREBASE
 */
function filtrarEAtualizar() {
    if (!window.noticiasFirebase) return;

    todasAsAnalisesLocais = window.noticiasFirebase
        .filter(n => n.origem === 'analises')
        .sort((a, b) => (b.data || 0) - (a.data || 0));

    termoBuscaAtivo ? processarFiltro() : atualizarInterface();
}

function iniciarIntegracao() {
    filtrarEAtualizar();
    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
}

/**
 * 🔎 FILTRO
 */
function processarFiltro() {
    if (!termoBuscaAtivo) {
        analisesFiltradas = [];
    } else {
        analisesFiltradas = todasAsAnalisesLocais.filter(n =>
            (n.titulo && n.titulo.toLowerCase().includes(termoBuscaAtivo)) ||
            (n.subtitulo && n.subtitulo.toLowerCase().includes(termoBuscaAtivo))
        );
    }

    noticiasExibidasCount = 5;
    atualizarInterface();
}

/**
 * 🖼️ RENDER
 */
function atualizarInterface() {
    const dadosParaExibir = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
    Interface.renderizarNoticias(dadosParaExibir, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao(dadosParaExibir.length, noticiasExibidasCount);
}

/**
 * 🎨 BLOCO EDITORIAL
 */
async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
}

function configurarEscutaBusca() {
    window.addEventListener('busca:termo', tratarEventoBusca);
    window.addEventListener('busca:limpar', tratarLimpezaBusca);
}
