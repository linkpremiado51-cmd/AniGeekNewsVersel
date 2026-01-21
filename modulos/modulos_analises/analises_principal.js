/**
 * ARQUIVO: modulos/modulos_analises/analises_principal.js
 * PAPEL: Módulo de Análises Profundas
 * VERSÃO: 6.0 - Fix de Identidade e Integração de Scroll
 */

import * as Funcoes from './analises_funcoes.js';
import * as Interface from './analises_interface.js';

let todasAsAnalisesLocais = [];
let analisesFiltradas = []; 
let noticiasExibidasCount = 5;
let termoBuscaAtivo = ""; 

const log = (msg) => window.logVisual ? window.logVisual(msg) : console.log(`[Análises]: ${msg}`);

window.inicializarSecao = function(containerRoot, contexto) {
    log(`Módulo Análises iniciado.`);
    iniciarIntegracao();
    configurarEscutaBusca(); 
    carregarBlocoEditorial();
    
    // 🛡️ Garante que o scroll volte ao topo ao carregar a seção para alinhar as abas
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    document.addEventListener('click', gerenciarCliquesLocais);
};

window.desmontarSecao = function() {
    log(`Limpando recursos...`);
    window.removeEventListener('busca:termo', tratarEventoBusca);
    window.removeEventListener('busca:limpar', tratarLimpezaBusca);
    window.removeEventListener('firebase:data_updated', filtrarEAtualizar);
    document.removeEventListener('click', gerenciarCliquesLocais);
    
    if (window.secaoComentarios) window.secaoComentarios.fechar();

    todasAsAnalisesLocais = [];
    analisesFiltradas = [];
    termoBuscaAtivo = "";
};

window.analises = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsAnalisesLocais.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia({ ...noticia, lista: todasAsAnalisesLocais });
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
            
            // 🛡️ Micro-interação: Scroll suave para os novos itens
            setTimeout(() => {
                window.scrollBy({ top: 300, behavior: 'smooth' });
            }, 100);
        }
    }
};

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

    // 🛡️ UNIFICAÇÃO DE CLASSES: Escuta tanto a classe nova quanto a antiga do seu CSS
    const btnMais = target.closest('.btn-paginacao-geek') || target.closest('.btn-carregar-mais');
    
    if (btnMais) {
        e.preventDefault();
        log("Botão carregar clicado.");
        window.analises.carregarMaisNovo();
        return;
    }

    if (target.closest('.comments-trigger-bar') && !target.closest('[data-global-modal="true"]')) {
        const artigo = target.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) window.analises.toggleComentarios(true, idNoticia);
    }
}

function filtrarEAtualizar() {
    if (window.noticiasFirebase) {
        todasAsAnalisesLocais = window.noticiasFirebase
            .filter(n => n.origem === 'analises')
            .sort((a, b) => (b.data || 0) - (a.data || 0));
        
        if (termoBuscaAtivo) processarFiltro();
        else atualizarInterface();
    }
}

function configurarEscutaBusca() {
    window.addEventListener('busca:termo', tratarEventoBusca);
    window.addEventListener('busca:limpar', tratarLimpezaBusca);
}

function processarFiltro() {
    if (!termoBuscaAtivo) analisesFiltradas = [];
    else {
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
