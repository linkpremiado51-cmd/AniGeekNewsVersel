/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo Global Autônomo de Comentários
 * VERSÃO: 5.4 - Diagnóstico de Clique e Rastreamento de Eventos
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// --- INICIALIZAÇÃO DA API GLOBAL ---
window.secaoComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`[API] Abrindo modal para: ${id}`);
        
        const modalExiste = document.getElementById('modal-comentarios-global');
        if (!modalExiste) {
            Interface.injetarEstruturaModal();
        }
        
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("[API] Fechando modal.");
        if (unsubscribeAtual) unsubscribeAtual();
        idConteudoAtual = null;
        
        // Verifica se a função de toggle existe e é chamada
        if (Funcoes.toggleComentarios) {
            Funcoes.toggleComentarios(false);
        } else {
            if (window.logVisual) window.logVisual("❌ Erro: Função toggleComentarios não encontrada.");
        }
        
        document.body.style.overflow = '';
    },
    enviar: () => enviarComentario()
};

const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let unsubscribeAtual = null;
let idConteudoAtual = null;

async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();
    idConteudoAtual = idConteudo;

    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        if (window.logVisual) window.logVisual("❌ Erro Firebase: " + error.code);
    });
}

async function enviarComentario() {
    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idConteudoAtual) return;

    const texto = input.value.trim();
    const nomeAutor = window.AniGeekUser?.nome || "Leitor Geek";
    input.value = ""; 

    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp()
        });
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro ao enviar.");
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Interface.injetarEstruturaModal());
} else {
    Interface.injetarEstruturaModal();
}

// Escuta de cliques globais com LOGS DE DIAGNÓSTICO
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Log detalhado para o console e logVisual
    const selectorDesc = target.id ? `#${target.id}` : (target.className ? `.${target.className.split(' ')[0]}` : target.tagName);
    
    // Verifica se o clique foi em elementos de fechar
    const closeBtn = target.closest('.btn-close-comentarios') || 
                     target.closest('#btn-fechar-comentarios') ||
                     target.closest('.modal-close-trigger');

    const isOverlay = target.classList.contains('modal-comentarios-overlay');

    if (closeBtn) {
        if (window.logVisual) window.logVisual(`[Debug] Clique no botão fechar: ${selectorDesc}`);
        window.secaoComentarios.fechar();
    } else if (isOverlay) {
        if (window.logVisual) window.logVisual("[Debug] Clique no fundo (overlay)");
        window.secaoComentarios.fechar();
    } else {
        // Log para qualquer outro clique apenas se necessário debugar camadas
        // console.log("Clique em:", selectorDesc);
    }

    if (e.target.closest('#btn-enviar-comentario') || e.target.closest('#btn-enviar-global')) {
        window.secaoComentarios.enviar();
    }
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        window.secaoComentarios.enviar();
    }
});

if (window.logVisual) window.logVisual("✔️ Diagnóstico de Comentários Ativo.");
