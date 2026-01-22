/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo de Comentários Integrado (Real-time)
 * VERSÃO: 10.0 - Integração Constitucional e Sync de Identidade
 * * 📌 DEPENDÊNCIAS IMPLÍCITAS (Ponto 8):
 * - Firebase SDK (Firestore)
 * - Global: window.auth (API de Identidade)
 * - Global: window.logVisual (Feedback)
 * - Local: ./comentarios_interface.js (Renderização)
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// 1. ESTADO CRÍTICO (Ponto 7)
const state = {
    unsubscribe: null,
    idAtual: null,
    db: null,
    isInitialized: false
};

const log = (msg) => window.logVisual ? window.logVisual(`[Comentários]: ${msg}`) : console.log(`[Comentários]: ${msg}`);

// 2. CONFIGURAÇÃO FIREBASE (Ponto 6 - Idempotência)
const firebaseConfig = {
    apiKey: "AIzaSyBC_ad4X9OwCHKvcG_pNQkKEl76Zw2tu6o",
    authDomain: "anigeeknews.firebaseapp.com",
    projectId: "anigeeknews",
    storageBucket: "anigeeknews.firebasestorage.app",
    messagingSenderId: "769322939926",
    appId: "1:769322939926:web:6eb91a96a3f74670882737"
};

function initFirebase() {
    if (getApps().length === 0) {
        const app = initializeApp(firebaseConfig);
        state.db = getFirestore(app);
    } else {
        state.db = getFirestore();
    }
}

/**
 * API GLOBAL (Ponto 10)
 */
window.secaoComentarios = {
    abrir: (id) => {
        if (!id) return;
        state.idAtual = id;
        
        log(`Abrindo canal para: ${id}`);
        
        // Limpeza de escuta anterior se houver
        if (state.unsubscribe) {
            state.unsubscribe();
            state.unsubscribe = null;
        }

        // 1. Injeta HTML via Interface
        Interface.injetarEstruturaModal(); 
        
        const modal = document.getElementById('modal-comentarios-global');
        if (modal) {
            configurarListenersLocais(modal);
            Funcoes.toggleComentarios(true, id);
            carregarComentariosRealTime(id);
            atualizarInterfaceAuth(); // Sincroniza com login atual
        }
    },

    fechar: () => {
        if (state.unsubscribe) {
            log("Encerrando conexão real-time.");
            state.unsubscribe();
            state.unsubscribe = null;
        }
        state.idAtual = null;
        if (Funcoes.toggleComentarios) Funcoes.toggleComentarios(false);
    },

    enviar: () => enviarComentario()
};

/**
 * SINCRONIZAÇÃO DE IDENTIDADE (Ponto 2 & 3)
 */
function atualizarInterfaceAuth() {
    const containerAcao = document.querySelector('.modal-comentarios-input-area');
    const input = document.getElementById('input-novo-comentario');
    if (!containerAcao || !input) return;

    const user = window.auth?.getUser();

    if (user) {
        containerAcao.classList.remove('user-deslogado');
        input.disabled = false;
        input.placeholder = `Comentar como ${user.nome || 'Geek'}...`;
    } else {
        containerAcao.classList.add('user-deslogado');
        input.disabled = true;
        input.placeholder = "Faça login para participar da conversa...";
    }
}

// Escuta os eventos oficiais do sistema definidos no auth.js
document.addEventListener('auth:login', () => {
    if (state.idAtual) atualizarInterfaceAuth();
});

document.addEventListener('auth:logout', () => {
    if (state.idAtual) atualizarInterfaceAuth();
});

/**
 * GESTÃO DE EVENTOS LOCAIS
 */
function configurarListenersLocais(modalElement) {
    if (!modalElement || modalElement.dataset.listenersAtivos === "true") return;

    modalElement.addEventListener('click', (e) => {
        const target = e.target;
        
        // Botão Fechar
        if (target.closest('.btn-close-comentarios') || target.closest('.modal-close-trigger')) {
            e.preventDefault();
            window.secaoComentarios.fechar();
            return;
        }

        // Botão Enviar
        if (target.closest('.btn-enviar-comentario')) {
            e.preventDefault();
            window.secaoComentarios.enviar();
        }
    });

    modalElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
            window.secaoComentarios.enviar();
        }
    });

    modalElement.dataset.listenersAtivos = "true";
}

/**
 * FIREBASE ACTIONS
 */
async function carregarComentariosRealTime(idConteudo) {
    if (!state.db) initFirebase();

    const colRef = collection(state.db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    state.unsubscribe = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        console.error("[Firebase Error]:", error);
    });
}

async function enviarComentario() {
    const user = window.auth?.getUser();
    
    if (!user) {
        log("⚠️ Ação bloqueada: Usuário deslogado.");
        return;
    }

    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !state.idAtual) return;

    const texto = input.value.trim();
    
    try {
        const colRef = collection(state.db, "analises", state.idAtual, "comentarios");
        await addDoc(colRef, {
            autor: user.nome || "Leitor Geek",
            texto: texto,
            data: serverTimestamp(),
            uid: user.uid || null
        });
        input.value = ""; 
    } catch (error) {
        log("❌ Falha ao publicar comentário.");
        console.error(error);
    }
}

// Inicialização segura
initFirebase();
