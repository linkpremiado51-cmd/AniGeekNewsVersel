/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo de Comentários Integrado (Mesma Tela)
 * VERSÃO: 8.0 - Gerenciamento de Memória e Unsubscribe Formal
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// Variáveis de controle de estado (Escopo do Módulo)
let unsubscribeAtual = null;
let idConteudoAtual = null;
let app, db;

// --- INICIALIZAÇÃO DA API GLOBAL ---
window.secaoComentarios = {
    abrir: (id) => {
        if (!id) return;
        if (window.logVisual) window.logVisual(`[UI] Integrando comentários para: ${id}`);
        
        // 🛡️ Garante que se houver uma escuta antiga de outra notícia, ela morra antes da nova
        if (unsubscribeAtual) {
            unsubscribeAtual();
            unsubscribeAtual = null;
        }

        Interface.injetarEstruturaModal(); 
        
        const modal = document.getElementById('modal-comentarios-global');
        if (modal) {
            configurarListenersLocais(modal);
            Funcoes.toggleComentarios(true, id);
            carregarComentariosRealTime(id);
        }
    },
    fechar: () => {
        // 🛡️ CRÍTICO: O "fechar" agora é um encerramento real de processo
        if (unsubscribeAtual) {
            if (window.logVisual) window.logVisual("[Firebase] Encerrando escuta de comentários.");
            unsubscribeAtual();
            unsubscribeAtual = null;
        }
        
        idConteudoAtual = null;
        
        if (Funcoes.toggleComentarios) {
            Funcoes.toggleComentarios(false);
        }
    },
    enviar: () => enviarComentario()
};

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737"
};

// Inicialização única
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (e) {
    console.error("[Comentários] Falha ao conectar Firebase:", e);
}

/**
 * CONFIGURAÇÃO DE LISTENERS LOCAIS
 */
function configurarListenersLocais(modalElement) {
    if (!modalElement || modalElement.dataset.listenersAtivos === "true") return;

    modalElement.addEventListener('click', (e) => {
        const target = e.target;
        const btnFechar = target.closest('.btn-close-comentarios') || target.closest('.modal-close-trigger');

        if (btnFechar) {
            e.preventDefault();
            window.secaoComentarios.fechar();
            return;
        }

        if (target.closest('.btn-enviar-comentario') || target.closest('#btn-enviar-global')) {
            e.preventDefault();
            window.secaoComentarios.enviar();
        }
    });

    const input = modalElement.querySelector('#input-novo-comentario');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.secaoComentarios.enviar();
        });
    }

    modalElement.dataset.listenersAtivos = "true";
}

async function carregarComentariosRealTime(idConteudo) {
    idConteudoAtual = idConteudo;

    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    // 🛡️ Atribuição da escuta à variável de controle para permitir o Unsubscribe
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
    
    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp()
        });
        input.value = ""; 
    } catch (error) {
        if (window.logVisual) window.logVisual("❌ Erro ao enviar.");
    }
}
