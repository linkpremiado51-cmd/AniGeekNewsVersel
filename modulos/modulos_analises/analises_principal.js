/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 5.0 - Ciclo de Vida Formalizado (Init/Destroy) e Clean Listeners
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

// Estado local do módulo
let todasAsAnalisesLocais = [];
let analisesFiltradas = []; 
let noticiasExibidasCount = 5;
let termoBuscaAtivo = ""; 

const log = (msg) => window.logVisual ? window.logVisual(msg) : console.log(`[Análises]: ${msg}`);

/**
 * --- CONTRATO DE CICLO DE VIDA ---
 * Formaliza a entrada e saída do módulo na memória da aplicação.
 */

window.inicializarSecao = function(containerRoot, contexto) {
    log(`Módulo Análises iniciado.`);
    iniciarIntegracao();
    configurarEscutaBusca(); 
    carregarBlocoEditorial();
    
    // Adiciona listener de clique com referência nomeada para remoção posterior
    document.addEventListener('click', gerenciarCliquesLocais);
};

window.desmontarSecao = function() {
    log(`Limpando recursos do módulo Análises...`);
    
    // 1. Remove Listeners do window/document (Usa as funções nomeadas abaixo)
    window.removeEventListener('busca:termo', tratarEventoBusca);
    window.removeEventListener('busca:limpar', tratarLimpezaBusca);
    window.removeEventListener('firebase:data_updated', filtrarEAtualizar);
    document.removeEventListener('click', gerenciarCliquesLocais);
    
    // 2. Garante que sub-módulos (Comentários) sejam encerrados
    if (window.secaoComentarios) {
        window.secaoComentarios.fechar();
    }

    // 3. Reset de estado para evitar vazamento de memória (Memory Leak)
    todasAsAnalisesLocais = [];
    analisesFiltradas = [];
    termoBuscaAtivo = "";
    
    log(`Módulo Análises desmontado com sucesso.`);
};

/**
 * Interface de Ações do Módulo
 */
window.analises = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia({
                ...noticia,
                lista: todasAsAnalisesLocais 
            });
        }
    },
    toggleComentarios: (abrir, id = null) => {
        if (window.secaoComentarios) {
            if (abrir) window.secaoComentarios.abrir(id);
            else window.secaoComentarios.fechar();
        }
    },
    carregarMaisNovo: () => {
        const listaAtual = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
        const totalDisponivel = listaAtual.length;
        
        if (noticiasExibidasCount >= totalDisponivel) {
            log(`Fim dos resultados.`);
        } else {
            noticiasExibidasCount += 5;
            atualizarInterface();
        }
    }
};

/**
 * --- TRATADORES DE EVENTOS (NOMEADOS) ---
 * Funções extraídas para permitir o removeEventListener.
 */

function tratarEventoBusca(e) {
    termoBuscaAtivo = e.detail.termo.toLowerCase();
    processarFiltro();
}

function tratarLimpezaBusca() {
    termoBuscaAtivo = "";
    processarFiltro();
}

function gerenciarCliquesLocais(e) {
    const target = e.target;

    // 1. Botão Carregar Mais
    const btnMais = target.closest('.btn-paginacao-geek');
    if (btnMais) {
        e.preventDefault();
        window.analises.carregarMaisNovo();
        return;
    }

    // 2. Abrir Comentários (Apenas se NÃO estiver clicando dentro do modal)
    if (target.closest('.comments-trigger-bar') && !target.closest('[data-global-modal="true"]')) {
        const artigo = target.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) {
            log(`Abrindo comentários para ${idNoticia}`);
            window.analises.toggleComentarios(true, idNoticia);
        }
    }
}

/**
 * Sincronização com Firebase
 */
function filtrarEAtualizar() {
    if (window.noticiasFirebase) {
        todasAsAnalisesLocais = window.noticiasFirebase
            .filter(n => n.origem === 'analises')
            .sort((a, b) => (b.data || 0) - (a.data || 0));
        
        if (termoBuscaAtivo) processarFiltro();
        else atualizarInterface();
    }
}

/**
 * --- LÓGICA DE APOIO ---
 */

function configurarEscutaBusca() {
    window.addEventListener('busca:termo', tratarEventoBusca);
    window.addEventListener('busca:limpar', tratarLimpezaBusca);
}

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

function atualizarInterface() {
    const dadosParaExibir = termoBuscaAtivo ? analisesFiltradas : todasAsAnalisesLocais;
    Interface.renderizarNoticias(dadosParaExibir, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao(dadosParaExibir.length, noticiasExibidasCount);
}

function iniciarIntegracao() {
    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) filtrarEAtualizar();
    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
}

async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo');
    if (tituloEl) tituloEl.textContent = "Análises Profundas";
}
