/**
 * ARQUIVO: comentarios_de_secao/comentarios_principal.js
 * PAPEL: Módulo Global Autônomo de Comentários (Auto-Injetável)
 * VERSÃO: 5.0 - Sincronizado com Identidade e Navegação SPA
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import * as Interface from './comentarios_interface.js';
import * as Funcoes from './comentarios_funcoes.js';

// Configuração Firebase (Unificada)
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

/**
 * Escuta os comentários no Firestore para uma notícia específica
 */
async function carregarComentariosRealTime(idConteudo) {
    if (unsubscribeAtual) unsubscribeAtual();
    idConteudoAtual = idConteudo;

    if (window.logVisual) window.logVisual(`Conectando mensagens de: ${idConteudo}`);
    
    // Caminho da sub-coleção dentro de 'analises'
    const colRef = collection(db, "analises", idConteudo, "comentarios");
    const q = query(colRef, orderBy("data", "asc"));

    unsubscribeAtual = onSnapshot(q, (snapshot) => {
        const comentarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (window.logVisual) window.logVisual(`${comentarios.length} mensagens lidas.`);
        
        // Renderiza na Interface Global
        Interface.renderizarListaComentarios(comentarios);
    }, (error) => {
        if (window.logVisual) window.logVisual("Erro Firebase Comentários.");
        console.error(error);
    });
}

/**
 * Processa o envio do comentário usando o autor logado ou anônimo
 */
async function enviarComentario() {
    const input = document.getElementById('input-novo-comentario');
    if (!input || !input.value.trim() || !idConteudoAtual) return;

    const texto = input.value.trim();
    const nomeAutor = window.AniGeekUser?.nome || "Leitor Geek";

    input.value = ""; // Limpeza rápida para UX

    try {
        const colRef = collection(db, "analises", idConteudoAtual, "comentarios");
        await addDoc(colRef, {
            autor: nomeAutor,
            texto: texto,
            data: serverTimestamp()
        });
        if (window.logVisual) window.logVisual("Comentário enviado!");
    } catch (error) {
        if (window.logVisual) window.logVisual("Erro ao comentar.");
        console.error(error);
    }
}

/**
 * EXPOSIÇÃO DA API GLOBAL
 * Qualquer parte do sistema (Análises, Smartphones, etc) chama estas funções.
 */
window.secaoComentarios = {
    abrir: (id) => {
        if (window.logVisual) window.logVisual(`Abrindo comentários: ${id}`);
        // Garante que a estrutura HTML existe no DOM
        Interface.injetarEstruturaModal(); 
        
        Funcoes.toggleComentarios(true, id);
        carregarComentariosRealTime(id);
    },
    fechar: () => {
        if (window.logVisual) window.logVisual("Fechando comentários.");
        if (unsubscribeAtual) unsubscribeAtual();
        idConteudoAtual = null;
        Funcoes.toggleComentarios(false);
    },
    enviar: enviarComentario
};

// --- INICIALIZAÇÃO E EVENTOS ---

// Injeta o modal automaticamente ao carregar o script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Interface.injetarEstruturaModal());
} else {
    Interface.injetarEstruturaModal();
}

// Ouvintes Globais para o Modal Injetado
document.addEventListener('click', (e) => {
    // Fechar
    const fecharBtn = e.target.closest('.btn-close-comentarios') || e.target.id === 'btn-fechar-comentarios';
    if (fecharBtn || e.target.classList.contains('modal-comentarios-overlay')) {
        window.secaoComentarios.fechar();
    }

    // Enviar
    if (e.target.closest('#btn-enviar-comentario') || e.target.closest('#btn-enviar-global')) {
        window.secaoComentarios.enviar();
    }
});

// Suporte ao Enter no input injetado
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'input-novo-comentario') {
        window.secaoComentarios.enviar();
    }
});

if (window.logVisual) window.logVisual("Módulo Comentários Global Ativado.");
