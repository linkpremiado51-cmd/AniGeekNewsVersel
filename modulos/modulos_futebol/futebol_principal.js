/**
 * ARQUIVO: modulos/modulos_futebol/futebol_principal.js
 * PAPEL: Módulo de Futebol Profissional
 * VERSÃO: 1.0 - Baseado na Estrutura Premium
 */

import * as Funcoes from './futebol_funcoes.js';
import * as Interface from './futebol_interface.js';

let todasAsNoticiasFutebol = [];
let futebolFiltrado = []; 
let noticiasExibidasCount = 5;
let termoBuscaAtivo = ""; 

const log = (msg) => window.logVisual ? window.logVisual(msg) : console.log(`[Futebol]: ${msg}`);

window.inicializarSecao = function(containerRoot, contexto) {
    log(`Módulo Futebol iniciado.`);
    iniciarIntegracao();
    configurarEscutaBusca(); 
    carregarBlocoEditorial();
    
    // 🛡️ Alinhamento de SPA
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    document.addEventListener('click', gerenciarCliquesLocais);
};

window.desmontarSecao = function() {
    log(`Limpando recursos de Futebol...`);
    window.removeEventListener('busca:termo', tratarEventoBusca);
    window.removeEventListener('busca:limpar', tratarLimpezaBusca);
    window.removeEventListener('firebase:data_updated', filtrarEAtualizar);
    document.removeEventListener('click', gerenciarCliquesLocais);
    
    if (window.secaoComentarios) window.secaoComentarios.fechar();

    todasAsNoticiasFutebol = [];
    futebolFiltrado = [];
    termoBuscaAtivo = "";
};

window.futebol = {
    ...Funcoes,
    abrirNoModalGlobal: (id) => {
        const noticia = todasAsNoticiasFutebol.find(n => n.id === id);
        if (noticia && window.abrirModalNoticia) {
            window.abrirModalNoticia({ ...noticia, lista: todasAsNoticiasFutebol });
        }
    },
    // Função para trocar o vídeo no carrossel cinemático
    trocarVideo: (playerId, idVid) => {
        const player = document.getElementById(playerId);
        if (player) {
            player.src = `https://www.youtube.com/embed/${idVid}?autoplay=1`;
            log("🎞️ Vídeo atualizado no carrossel.");
        }
    },
    toggleComentarios: (abrir, id = null) => {
        if (window.secaoComentarios) {
            if (abrir) window.secaoComentarios.abrir(id);
            else window.secaoComentarios.fechar();
        }
    },
    carregarMaisNovo: () => {
        const listaAtual = termoBuscaAtivo ? futebolFiltrado : todasAsNoticiasFutebol;
        const totalDisponivel = listaAtual.length;
        
        if (noticiasExibidasCount >= totalDisponivel) {
            log(`Fim dos resultados de futebol.`);
        } else {
            noticiasExibidasCount += 5;
            atualizarInterface();
            
            setTimeout(() => {
                window.scrollBy({ top: 400, behavior: 'smooth' });
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
    const btnMais = target.closest('.btn-paginacao-futebol') || target.closest('.btn-carregar-mais');
    
    if (btnMais) {
        e.preventDefault();
        log("Carregando mais notícias...");
        window.futebol.carregarMaisNovo();
        return;
    }

    if (target.closest('.community-trigger-modern') || target.closest('.comments-trigger-bar')) {
        const artigo = target.closest('article');
        const idNoticia = artigo ? artigo.id.replace('artigo-', '') : null;
        if (idNoticia) window.futebol.toggleComentarios(true, idNoticia);
    }
}

function filtrarEAtualizar() {
    if (window.noticiasFirebase) {
        // 🎯 FILTRO CRÍTICO: Busca apenas a ID 'futebol' no Firebase
        todasAsNoticiasFutebol = window.noticiasFirebase
            .filter(n => n.origem === 'futebol')
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        if (termoBuscaAtivo) processarFiltro();
        else atualizarInterface();
    }
}

function configurarEscutaBusca() {
    window.addEventListener('busca:termo', tratarEventoBusca);
    window.addEventListener('busca:limpar', tratarLimpezaBusca);
}

function processarFiltro() {
    if (!termoBuscaAtivo) futebolFiltrado = [];
    else {
        futebolFiltrado = todasAsNoticiasFutebol.filter(n => 
            (n.titulo && n.titulo.toLowerCase().includes(termoBuscaAtivo)) ||
            (n.resumo && n.resumo.toLowerCase().includes(termoBuscaAtivo))
        );
    }
    noticiasExibidasCount = 5; 
    atualizarInterface();
}

function atualizarInterface() {
    const dadosParaExibir = termoBuscaAtivo ? futebolFiltrado : todasAsNoticiasFutebol;
    // Renderiza usando a interface de futebol
    Interface.renderizarNoticias(dadosParaExibir, noticiasExibidasCount);
    Interface.renderizarBotaoPaginacao(dadosParaExibir.length, noticiasExibidasCount);
}

function iniciarIntegracao() {
    if (window.noticiasFirebase && window.noticiasFirebase.length > 0) filtrarEAtualizar();
    window.addEventListener('firebase:data_updated', filtrarEAtualizar);
}

async function carregarBlocoEditorial() {
    const tituloEl = document.getElementById('capa-titulo-futebol');
    if (tituloEl) tituloEl.textContent = "Futebol Profissional";
}
