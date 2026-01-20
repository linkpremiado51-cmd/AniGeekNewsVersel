/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo Global Autônomo de Comentários
 * VERSÃO: 5.5 - Correção Crítica de Propagação (Anti-Vazamento SPA)
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
        
        if (Funcoes.toggleComentarios) {
            Funcoes.toggleComentarios(false);
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

// Escuta de cliques globais com INTERRUPÇÃO DE PROPAGAÇÃO
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Identifica elementos de fechar
    const closeBtn = target.closest('.btn-close-comentarios') || 
                     target.closest('#btn-fechar-comentarios') ||
                     target.closest('.modal-close-trigger');

    const isOverlay = target.classList.contains('modal-comentarios-overlay');

    if (closeBtn || isOverlay) {
        // 🛑 ESSENCIAL: Mata o evento para que o navegacao.js não o veja
        e.preventDefault();
        e.stopPropagation(); 
        
        if (window.logVisual) window.logVisual(`[Sistema] Fechamento seguro acionado.`);
        window.secaoComentarios.fechar();
        return; // Sai da função imediatamente
    }

    if (e.target.closest('#btn-enviar-comentario') || e.target.closest('#btn-enviar-global')) {
        e.preventDefault();
        e.stopPropagation();
        window.secaoComentarios.enviar();
    }
}, true); // Captura antecipada

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        window.secaoComentarios.enviar();
    }
});
