/* ======================================================
   AniGeekNews – Enterprise Section System v7.1 (Full)
   • Títulos de Sessão Clicáveis (Categorias Pai)
   • Notificações Toast Profissionais (Sem Alert)
   • Controle de Foco (Teclado não abre sozinho)
   • Design Harmônico
   • URLs Compartilháveis por Aba
   • Deep Linking: Abre aba correta ao receber ID de notícia
====================================================== */

(function(){

const CONFIG = {
  MAX_TABS: 19,
  KEYS: {
    ORDER: 'ag_v7_order',
    MODE:  'ag_v7_mode', // 'dynamic' ou 'fixed'
    STATS: 'ag_v7_stats'
  }
};

/* ===========================
   BANCO DE DADOS (COM IDs NAS SEsSÕES)
=========================== */
const CATALOGO = [
{ sessao: "Jujutsu Kaisen Shimetsu Kaiyu", id: "Jujutsu_kaisen_shimetsu_kaiyu", cor: "#e63946", itens: [] },
{ sessao: "Akame Ga Kill", id: "akame_ga_kill", cor: "#f1faee", itens: [] },
{ sessao: "Angel Beats", id: "angel_beats", cor: "#a8dadc", itens: [] },
{ sessao: "Angelic Layer", id: "angelic_layer", cor: "#457b9d", itens: [] },
{ sessao: "Anime I Geek", id: "anime_i_geek", cor: "#1d3557", itens: [] },
{ sessao: "Assassination Classroom", id: "assassination_classroom", cor: "#fca311", itens: [] },
{ sessao: "Attack On Titan Final Season", id: "attack_on_titan_final_season", cor: "#ff6b6b", itens: [] },
{ sessao: "Attack On Titan Final Season Part 2", id: "attack_on_titan_final_season_part_2", cor: "#6a4c93", itens: [] },
{ sessao: "Bakuman", id: "bakuman", cor: "#ffb703", itens: [] },
{ sessao: "Black Bullet", id: "black_bullet", cor: "#219ebc", itens: [] },
{ sessao: "Black Clover", id: "black_clover", cor: "#023e8a", itens: [] },
{ sessao: "Bleach", id: "bleach", cor: "#e63946", itens: [] },
{ sessao: "Blue Lock", id: "blue_lock", cor: "#00b4d8", itens: [] },
{ sessao: "Blue Period", id: "blue_period", cor: "#7209b7", itens: [] },
{ sessao: "Boku No Hero Academia Season 5", id: "boku_no_hero_academia_season_5", cor: "#f77f00", itens: [] },
{ sessao: "Boku No Hero Academia Season 6", id: "boku_no_hero_academia_season_6", cor: "#ffbe0b", itens: [] },
{ sessao: "Boruto", id: "boruto", cor: "#8ac926", itens: [] },
{ sessao: "Cells At Work", id: "cells_at_work", cor: "#1982c4", itens: [] },
{ sessao: "Cells At Work Black", id: "cells_at_work_black", cor: "#6a4c93", itens: [] },
{ sessao: "Chainsaw Man", id: "chainsaw_man", cor: "#d62828", itens: [] },
{ sessao: "Chainsaw Man Part 2", id: "chainsaw_man_part_2", cor: "#f77f00", itens: [] },
{ sessao: "Clannad", id: "clannad", cor: "#ffb703", itens: [] },
{ sessao: "Classroom Of The Elite", id: "classroom_of_the_elite", cor: "#023e8a", itens: [] },
{ sessao: "Classroom Of The Elite Season 2", id: "classroom_of_the_elite_season_2", cor: "#00b4d8", itens: [] },
{ sessao: "Code Geass", id: "code_geass", cor: "#f94144", itens: [] },
{ sessao: "Cowboy Bebop", id: "cowboy_bebop", cor: "#7209b7", itens: [] },
{ sessao: "Death Note", id: "death_note", cor: "#ff6d00", itens: [] },
{ sessao: "Demon Slayer Kimetsu No Yaiba", id: "demon_slayer_kimetsu_no_yaiba", cor: "#f72585", itens: [] },
{ sessao: "Demon Slayer Entertainment District", id: "demon_slayer_kimetsu_no_yaiba_entertainment_district", cor: "#b5179e", itens: [] },
{ sessao: "Demon Slayer Mugen Train", id: "demon_slayer_kimetsu_no_yaiba_mugen_train", cor: "#7209b7", itens: [] },
{ sessao: "Demon Slayer Swordsmith Village", id: "demon_slayer_kimetsu_no_yaiba_swordsmith_village", cor: "#3a0ca3", itens: [] },
{ sessao: "Devilman Crybaby", id: "devilman_crybaby", cor: "#4361ee", itens: [] },
{ sessao: "Dr Stone", id: "dr_stone", cor: "#4895ef", itens: [] },
{ sessao: "Elfen Lied", id: "elfen_lied", cor: "#4cc9f0", itens: [] },
{ sessao: "Eromanga Sensei", id: "eromanga_sensei", cor: "#7209b7", itens: [] },
{ sessao: "Fire Force", id: "fire_force", cor: "#f94144", itens: [] },
{ sessao: "Food Wars Shokugeki No Soma", id: "food_wars_shokugeki_no_soma", cor: "#ffba08", itens: [] },
{ sessao: "Fullmetal Alchemist Brotherhood", id: "fullmetal_alchemist_brotherhood", cor: "#8d99ae", itens: [] },
{ sessao: "Guilty Crown", id: "guilty_crown", cor: "#ef233c", itens: [] },
{ sessao: "Haikyuu", id: "haikyuu", cor: "#06d6a0", itens: [] },
{ sessao: "Hells Paradise", id: "hells_paradise", cor: "#118ab2", itens: [] },
{ sessao: "Horimiya", id: "horimiya", cor: "#073b4c", itens: [] },
{ sessao: "Hunter X Hunter", id: "hunter_x_hunter", cor: "#ffd166", itens: [] },
{ sessao: "Jujutsu Kaisen", id: "jujutsu_kaisen", cor: "#06d6a0", itens: [] },
{ sessao: "Kaguya Sama Love Is War", id: "kaguya_sama_love_is_war", cor: "#118ab2", itens: [] },
{ sessao: "Kaguya Sama Love Is War Season 2", id: "kaguya_sama_love_is_war_season_2", cor: "#073b4c", itens: [] },
{ sessao: "Kaguya Sama Love Is War Season 3", id: "kaguya_sama_love_is_war_season_3", cor: "#ff6d00", itens: [] },
{ sessao: "Kimi No Suizou Wo Tabetai", id: "kimi_no_suizou_wo_tabetai", cor: "#7209b7", itens: [] },
{ sessao: "Kingdom", id: "kingdom", cor: "#f94144", itens: [] },
{ sessao: "Komi Cant Communicate", id: "komi_cant_communicate", cor: "#06d6a0", itens: [] },
{ sessao: "Komi Cant Communicate Season 2", id: "komi_cant_communicate_season_2", cor: "#073b4c", itens: [] },
{ sessao: "Kuroko No Basket", id: "kuroko_no_basket", cor: "#118ab2", itens: [] },
{ sessao: "Kuroshitsuji", id: "kuroshitsuji", cor: "#06d6a0", itens: [] },
{ sessao: "Made In Abyss", id: "made_in_abyss", cor: "#ffd166", itens: [] },
{ sessao: "Made In Abyss Dawn Of The Deep Soul", id: "made_in_abyss_dawn_of_the_deep_soul", cor: "#ef476f", itens: [] },
{ sessao: "Made In Abyss Retsujitsu", id: "made_in_abyss_retsujitsu", cor: "#06d6a0", itens: [] },
{ sessao: "Maiden Slayer", id: "maiden_slayer", cor: "#118ab2", itens: [] },
{ sessao: "Mob Psycho 100", id: "mob_psycho_100", cor: "#073b4c", itens: [] },
{ sessao: "My Hero Academia", id: "my_hero_academia", cor: "#ff6d00", itens: [] },
{ sessao: "My Next Life As A Villainess", id: "my_next_life_as_a_villainess", cor: "#f94144", itens: [] },
{ sessao: "Naruto", id: "naruto", cor: "#06d6a0", itens: [] },
{ sessao: "Neon Genesis Evangelion", id: "neon_genesis_evangelion", cor: "#073b4c", itens: [] },
{ sessao: "Noragami", id: "noragami", cor: "#ff6d00", itens: [] },
{ sessao: "Oddtaxi", id: "oddtaxi", cor: "#ef233c", itens: [] },
{ sessao: "One Piece", id: "one_piece", cor: "#ffd166", itens: [] },
{ sessao: "One Punch Man", id: "one_punch_man", cor: "#06d6a0", itens: [] },
{ sessao: "Oregairu", id: "oregairu", cor: "#073b4c", itens: [] },
{ sessao: "Oregairu Season 2", id: "oregairu_season_2", cor: "#ff6d00", itens: [] },
{ sessao: "Owari No Seraph", id: "owari_no_seraph", cor: "#f94144", itens: [] },
{ sessao: "Platinum End", id: "platinum_end", cor: "#06d6a0", itens: [] },
{ sessao: "Psycho Pass", id: "psycho_pass", cor: "#118ab2", itens: [] },
{ sessao: "Re Zero Kara Hajimeru Isekai Seikatsu", id: "re_zero_kara_hajimeru_isekai_seikatsu", cor: "#073b4c", itens: [] },
{ sessao: "Rent A Girlfriend", id: "rent_a_girlfriend", cor: "#ff6d00", itens: [] },
{ sessao: "Rent A Girlfriend Season 2", id: "rent_a_girlfriend_season_2", cor: "#ef233c", itens: [] },
{ sessao: "Rurouni Kenshin", id: "rurouni_kenshin", cor: "#06d6a0", itens: [] },
{ sessao: "Saihate No Paladin", id: "saihate_no_paladin", cor: "#118ab2", itens: [] },
{ sessao: "Samurai Champloo", id: "samurai_champloo", cor: "#073b4c", itens: [] },
{ sessao: "Sentenced To Be A Hero", id: "sentenced_to_be_a_hero", cor: "#ff6d00", itens: [] },
{ sessao: "Seven Deadly Sins", id: "seven_deadly_sins", cor: "#f94144", itens: [] },
{ sessao: "Shadows House", id: "shadows_house", cor: "#06d6a0", itens: [] },
{ sessao: "Shadows House Season 2", id: "shadows_house_season_2", cor: "#118ab2", itens: [] },
{ sessao: "Shaman King", id: "shaman_king", cor: "#073b4c", itens: [] },
{ sessao: "Shingeki No Kyojin", id: "shingeki_no_kyojin", cor: "#ff6d00", itens: [] },
{ sessao: "Solo Leveling", id: "solo_leveling", cor: "#ef233c", itens: [] },
{ sessao: "Spy X Family", id: "spy_x_family", cor: "#ffd166", itens: [] },
{ sessao: "Steins Gate", id: "steins_gate", cor: "#06d6a0", itens: [] },
{ sessao: "Steins Gate 0", id: "steins_gate_0", cor: "#073b4c", itens: [] },
{ sessao: "Sword Art Online", id: "sword_art_online", cor: "#ff6d00", itens: [] },
{ sessao: "The Ancient Magus Bride", id: "the_ancient_magus_bride", cor: "#f94144", itens: [] },
{ sessao: "The Case Study Of Vanitas", id: "the_case_study_of_vanitas", cor: "#06d6a0", itens: [] },
{ sessao: "The Case Study Of Vanitas Season 2", id: "the_case_study_of_vanitas_season_2", cor: "#073b4c", itens: [] },
{ sessao: "The Quintessential Quintuplets", id: "the_quintessential_quintuplets", cor: "#ff6d00", itens: [] },
{ sessao: "The Rising Of The Shield Hero", id: "the_rising_of_the_shield_hero", cor: "#ef233c", itens: [] },
{ sessao: "The World God Only Knows", id: "the_world_god_only_knows", cor: "#ffd166", itens: [] },
{ sessao: "Tokyo Revengers", id: "tokyo_revengers", cor: "#06d6a0", itens: [] },
{ sessao: "Toradora", id: "toradora", cor: "#073b4c", itens: [] },
{ sessao: "Vinland Saga", id: "vinland_saga", cor: "#ff6d00", itens: [] },
{ sessao: "Vinland Saga Season 2", id: "vinland_saga_season_2", cor: "#f94144", itens: [] },
{ sessao: "Weathering With You", id: "weathering_with_you", cor: "#06d6a0", itens: [] },
{ sessao: "Your Lie In April", id: "your_lie_in_april", cor: "#073b4c", itens: [] },
{ sessao: "Your Name", id: "your_name", cor: "#ff6d00", itens: [] },
{ sessao: "Yuyu Hakusho", id: "yuyu_hakusho", cor: "#ef233c", itens: [] }
];

/* ===========================
   CSS INJETADO
=========================== */
const styles = `
  /* --- LAYOUT DA GAVETA --- */
  #ag-drawer {
    background: #ffffff;
    border-bottom: 1px solid #e0e0e0;
    overflow: hidden;
    max-height: 0;
    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
    opacity: 0;
    width: 100%;
    position: absolute;
    left: 0;
    z-index: 1000;
    box-shadow: 0 10.5px 21px rgba(0,0,0,0.08);
  }

  body.dark-mode #ag-drawer {
    background: #141414;
    border-color: #333;
    box-shadow: 0 10.5px 21px rgba(0,0,0,0.5);
  }

  #ag-drawer.open {
    max-height: 85vh;
    opacity: 1;
  }

  /* --- CAPA DO MENU --- */
  .ag-drawer-cover {
    position: relative;
    width: 100%;
    height: 120px;
    background-image: url('https://i.postimg.cc/HWM72wfT/the-pensive-journey-by-chcofficial-dhme17e-pre.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin-bottom: 21px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  body.dark-mode .ag-drawer-cover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  /* IMAGEM DO PERSONAGEM FIXA NO CANTO */
  .ag-char-fixed {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 95%;
    width: auto;
    max-width: 50vw;
    object-fit: contain;
    object-position: bottom right;
    pointer-events: none;
    z-index: 0;
    /* Efeito Fade Out (Sair) */
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
  }

  /* Efeito Fade In (Aparecer) - Apenas opacidade, sem movimento */
  #ag-drawer.open .ag-char-fixed {
    opacity: 1;
  }

  .ag-drawer-scroll {
    position: relative;
    z-index: 5;
    max-height: 85vh;
    overflow-y: auto;
    padding: 21px 14px;
    scrollbar-width: thin;
  }

  /* --- HEADER: PESQUISA E MODOS (ESTÉTICA HIGH-END) --- */
  .ag-drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    max-width: 840px;

    /* Fixação no topo com efeito vidro */
    position: sticky;
    top: -21px; /* Alinhado ao topo do container */
    z-index: 100;
    margin: -21px auto 21px auto;
    padding: 17.5px 0;

    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8.4px);
    -webkit-backdrop-filter: blur(8.4px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: background 0.3s ease;
  }

  body.dark-mode .ag-drawer-header {
    background: rgba(20, 20, 20, 0.85);
    border-color: rgba(255, 255, 255, 0.08);
  }

  /* Efeito de degradê inferior para suavizar a rolagem dos itens */
  .ag-drawer-header::after {
    content: '';
    position: absolute;
    bottom: -14px;
    left: 0;
    width: 100%;
    height: 14px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), transparent);
    pointer-events: none;
  }

  body.dark-mode .ag-drawer-header::after {
    background: linear-gradient(to bottom, rgba(20, 20, 20, 0.9), transparent);
  }

  .ag-search-wrapper {
    position: relative;
    flex: 1;
    min-width: 196px;
  }

  .ag-search-icon-svg {
    position: absolute;
    left: 9.8px;
    top: 50%;
    transform: translateY(-50%);
    width: 12.6px;
    height: 12.6px;
    fill: #999;
    pointer-events: none;
  }

  .ag-search-input {
    width: 100%;
    padding: 7.7px 10.5px 7.7px 31.5px;
    border-radius: 7px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.04);
    font-size: 9.8px;
    font-weight: 500;
    outline: none;
    transition: all 0.3s ease;
  }

  body.dark-mode .ag-search-input {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.1);
    color: #fff;
  }

  .ag-search-input:focus {
    background: #fff;
    border-color: var(--primary-color, #e50914);
    box-shadow: 0 2.8px 10.5px rgba(0,0,0,0.08);
  }
  body.dark-mode .ag-search-input:focus { background: #252525; }

  /* --- BOTÕES DE MODO --- */
  .ag-mode-group {
    background: rgba(0,0,0,0.05);
    padding: 2.8px;
    border-radius: 7px;
    display: flex;
  }
  body.dark-mode .ag-mode-group { background: rgba(255,255,255,0.08); }

  .ag-mode-btn {
    padding: 5.6px 11.2px;
    border: none;
    background: transparent;
    border-radius: 4.9px;
    font-size: 7.7px; font-weight: 800;
    color: #888;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }

  .ag-mode-btn.active {
    background: #fff;
    color: #000;
    box-shadow: 0 1.4px 5.6px rgba(0,0,0,0.12);
  }
  body.dark-mode .ag-mode-btn.active {
    background: #333;
    color: #fff;
  }

  /* --- SESSÕES (CABEÇALHOS CLICÁVEIS) --- */
  .ag-section-block {
    margin-bottom: 24.5px;
    max-width: 840px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Estilo do título que agora é um botão */
  .ag-section-header-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 8.4px;
    background: transparent;
    border: none;
    padding: 3.5px 0;
    cursor: pointer;
    width: fit-content;
    transition: 0.2s;
  }

  .ag-section-header-btn:hover {
    opacity: 0.7;
  }

  .ag-section-text {
    font-size: 9.8px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: #333;
  }
  body.dark-mode .ag-section-text { color: #fff; }

  /* Indicador visual de que o título está selecionado */
  .ag-section-header-btn.is-active .ag-section-text {
    color: var(--primary-color, #e50914);
    text-decoration: underline;
    text-decoration-thickness: 1.4px;
    text-underline-offset: 2.8px;
  }

  .ag-section-marker {
    width: 7px;
    height: 7px;
    border-radius: 2.1px;
    box-shadow: 0 0 3.5px rgba(0,0,0,0.2);
  }

  /* --- GRID --- */
  .ag-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
    gap: 7px;
  }

  .ag-card {
    position: relative;
    background: #f9f9f9;
    border: 1px solid transparent;
    border-radius: 4.2px;
    padding: 8.4px 7px;
    font-size: 9.1px;
    font-weight: 500;
    color: #444;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  body.dark-mode .ag-card {
    background: #1e1e1e;
    color: #ccc;
  }

  .ag-card:hover {
    background: #ececec;
    transform: translateY(-1.4px);
  }
  body.dark-mode .ag-card:hover { background: #2a2a2a; }

  .ag-card.is-selected {
    background: #fff;
    border-color: var(--primary-color, #e50914);
    color: var(--primary-color, #e50914);
    box-shadow: inset 0 0 0 0.7px var(--primary-color, #e50914);
    font-weight: 700;
  }
  body.dark-mode .ag-card.is-selected { background: #1a1a1a; }

  .ag-card-action {
    position: absolute;
    top: 2.1px;
    right: 2.8px;
    width: 11.2px;
    height: 11.2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    border-radius: 50%;
    color: inherit;
    opacity: 0.6;
    transition: 0.2s;
  }

  .ag-card-action:hover {
    background: var(--primary-color, #e50914);
    color: #fff !important;
    opacity: 1;
  }

  /* --- TOAST NOTIFICATION (Substituto do Alert) --- */
  #ag-toast-container {
    position: fixed;
    bottom: 21px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .ag-toast {
    background: rgba(30, 30, 30, 0.95);
    color: #fff;
    padding: 8.4px 16.8px;
    border-radius: 35px;
    font-size: 9.1px;
    font-weight: 600;
    box-shadow: 0 3.5px 10.5px rgba(0,0,0,0.3);
    backdrop-filter: blur(3.5px);
    opacity: 0;
    transform: translateY(14px);
    animation: agSlideUp 0.3s forwards;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .ag-toast.error { border-left: 2.8px solid #ff4444; }
  .ag-toast.success { border-left: 2.8px solid #00C851; }

  @keyframes agSlideUp {
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes agFadeOut {
    to { opacity: 0; transform: translateY(-7px); }
  }

  /* --- AJUSTE PARA BOTÃO PROFISSIONAL E FIXO --- */
  #filterScroller {
    display: flex;
    align-items: center;
    position: relative;
    gap: 5.6px;
    padding-right: 0 !important;
    overflow-x: auto;
    scrollbar-width: none; /* Esconde scroll no Firefox */
    flex-wrap: nowrap; /* Mantém em uma linha única */
  }
  #filterScroller::-webkit-scrollbar { display: none; } /* Esconde scroll no Chrome/Safari */

  .filter-tag.cfg-btn {
    position: sticky;
    right: 0 !important;
    z-index: 99;

    /* Estética Profissional: Glassmorphism */
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5.6px);
    -webkit-backdrop-filter: blur(5.6px);

    min-width: 33.6px;
    height: 23.8px;
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Borda e Sombra refinadas */
    border: none;
    border-left: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: -7px 0 14px rgba(0, 0, 0, 0.05);

    cursor: pointer;
    font-size: 12.6px;
    transition: all 0.3s ease;
  }

  /* Efeito de degradê para as abas sumirem suavemente atrás do botão */
  .filter-tag.cfg-btn::before {
    content: '';
    position: absolute;
    left: -14px;
    top: 0;
    width: 14px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.9));
    pointer-events: none;
  }

  /* Ajustes para o Dark Mode */
  body.dark-mode .filter-tag.cfg-btn {
    background: rgba(20, 20, 20, 0.9);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: -10.5px 0 17.5px rgba(0, 0, 0, 0.5);
  }

  body.dark-mode .filter-tag.cfg-btn::before {
    background: linear-gradient(to right, transparent, rgba(20, 20, 20, 0.9));
  }

  /* Feedback visual ao tocar/clicar */
  .filter-tag.cfg-btn:active {
    transform: scale(0.9);
    opacity: 0.8;
  }

  /* --- BARRA DE PESQUISA FIXA NO TOPO --- */
  .ag-top-bar {
    position: sticky;
    top: 0;
    z-index: 1100;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 14px 0;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  body.dark-mode .ag-top-bar {
    background: rgba(20, 20, 20, 0.95);
    border-color: rgba(255,255,255,0.1);
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }

  .ag-top-bar-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 21px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .ag-top-search {
    flex: 1;
    min-width: 200px;
  }

  .ag-top-search input {
    width: 100%;
    padding: 8px 12px 8px 32px;
    border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.03);
    font-size: 14px;
    outline: none;
    transition: all 0.3s;
  }

  body.dark-mode .ag-top-search input {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.1);
    color: #fff;
  }

  .ag-top-search input:focus {
    border-color: var(--primary-color, #e50914);
    background: #fff;
    box-shadow: 0 0 15px rgba(229, 9, 20, 0.1);
  }

  body.dark-mode .ag-top-search input:focus {
    background: #2a2a2a;
  }

  .ag-top-buttons {
    display: flex;
    gap: 8px;
  }

  .ag-top-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: rgba(0,0,0,0.05);
    color: #333;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  body.dark-mode .ag-top-btn {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  .ag-top-btn:hover {
    background: rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  body.dark-mode .ag-top-btn:hover {
    background: rgba(255,255,255,0.15);
  }

  .ag-top-btn.active {
    background: var(--primary-color, #e50914);
    color: #fff;
    box-shadow: 0 4px 12px rgba(229, 9, 20, 0.3);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

/* ===========================
   SISTEMA DE TOAST (NOTIFICAÇÃO)
=========================== */
function showToast(message, type = 'normal') {
  let container = document.getElementById('ag-toast-container');
  if(!container) {
    container = document.createElement('div');
    container.id = 'ag-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `ag-toast ${type}`;
  toast.innerHTML = message;

  container.appendChild(toast);

  // Remove após 3 segundos
  setTimeout(() => {
    toast.style.animation = 'agFadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ===========================
   LÓGICA CORE
=========================== */
function load(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }
function save(k,v){ localStorage.setItem(k,JSON.stringify(v)); }

function getMode(){ return load(CONFIG.KEYS.MODE, 'dynamic'); }
function setMode(m){ save(CONFIG.KEYS.MODE, m); renderDrawer(); }

function getOrder(){
  const saved = load(CONFIG.KEYS.ORDER, null);
  if(saved) return saved;
  // Padrão inicial com alguns IDs
  return ['anime_i_geek', 'saihate_no_paladin', 'Jujutsu_kaisen_shimetsu_kaiyu'];
}

// Encontra ITEM ou CATEGORIA PAI pelo ID
function findItem(id){
  for(let sec of CATALOGO){
    // Verifica se é a própria categoria
    if(sec.id === id) return sec;
    // Verifica itens internos
    const item = sec.itens.find(i => i.id === id);
    if(item) return item;
  }
  return null;
}

function track(id){
  if(getMode() !== 'dynamic') return;
  const stats = load(CONFIG.KEYS.STATS, {});
  stats[id] = (stats[id] || 0) + 1;
  save(CONFIG.KEYS.STATS, stats);

  const order = getOrder();
  order.sort((a,b) => (stats[b]||0) - (stats[a]||0));
  save(CONFIG.KEYS.ORDER, order);
}

/* ===========================
   RENDERIZAÇÃO BARRA HORIZONTAL
=========================== */
function renderBar(){
  const bar = document.getElementById('filterScroller');
  if(!bar) return;

  let drawer = document.getElementById('ag-drawer');
  if(!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'ag-drawer';
    bar.parentNode.insertBefore(drawer, bar.nextSibling);
  }

  const order = getOrder();
  bar.innerHTML = '';

  order.forEach(id => {
    const item = findItem(id);
    if(!item) return;

    const btn = document.createElement('button');
    btn.className = 'filter-tag';
    btn.textContent = item.label || item.sessao;
    btn.dataset.id = id;
    btn.onclick = () => {
      document.querySelectorAll('#filterScroller .filter-tag').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      track(id);
      document.getElementById('ag-drawer').classList.remove('open');

      // 🔗 Atualiza URL sem recarregar (usando replaceState para navegação interna)
      const url = new URL(window.location);
      url.searchParams.set('secao', id);
      window.history.replaceState({}, '', url);

      if(window.carregarSecao) window.carregarSecao(id);
      else console.log("Carregando:", id);
    };
    bar.appendChild(btn);
  });

  const cfg = document.createElement('button');
  cfg.className = 'filter-tag cfg-btn';
  cfg.innerHTML = '⚙';
  cfg.onclick = toggleDrawer;
  bar.appendChild(cfg);
}

/* ===========================
   GAVETA (DRAWER)
=========================== */
function toggleDrawer(){
  const drawer = document.getElementById('ag-drawer');
  if(!drawer) return;

  if(drawer.classList.contains('open')){
    drawer.classList.remove('open');
  } else {
    renderDrawer();
    drawer.classList.add('open');
  }
}

function renderDrawer(filterText = ""){
  const drawer = document.getElementById('ag-drawer');
  const currentOrder = getOrder();
  const currentMode = getMode();

  const searchIcon = `<svg class="ag-search-icon-svg" viewBox="0 0 24 24"><path d="M21.71 20.29l-5.01-5.01C17.54 13.68 18 11.91 18 10c0-4.41-3.59-8-8-8S2 5.59 2 10s3.59 8 8 8c1.91 0 3.68-.46 5.28-1.3l5.01 5.01c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41z"/></svg>`;

  let html = `
    <div class="ag-drawer-cover"></div>
    <img src="https://i.postimg.cc/W49RX3dK/anime-boy-render-04-by-luxio56lavi-d5xed2a.png" class="ag-char-fixed" alt="Anime Character">
    <div class="ag-drawer-scroll">
      <div class="ag-drawer-header">
        <div class="ag-search-wrapper">
          ${searchIcon}
          <input type="text" class="ag-search-input" id="ag-search-input" placeholder="Pesquisar..." value="${filterText}">
        </div>

        <div class="ag-mode-group">
          <button id="btn-fixo" class="ag-mode-btn ${currentMode==='fixed'?'active':''}">Fixo</button>
          <button id="btn-dinamico" class="ag-mode-btn ${currentMode==='dynamic'?'active':''}">Automático</button>
        </div>
      </div>

      <div id="ag-catalog-container"></div>

      <div style="text-align:center; padding-top:20px; font-size:12px; color:#888;">
        ${currentOrder.length} de ${CONFIG.MAX_TABS} abas ativas
      </div>
    </div>
  `;

  drawer.innerHTML = html;

  const container = document.getElementById('ag-catalog-container');
  const term = filterText.toLowerCase();

  CATALOGO.forEach(sec => {
    const itensFiltrados = sec.itens.filter(i => i.label.toLowerCase().includes(term));
    const sessaoMatch = sec.sessao.toLowerCase().includes(term);

    if(term !== "" && !sessaoMatch && itensFiltrados.length === 0) return;
    const itensParaMostrar = sessaoMatch ? sec.itens : itensFiltrados;

    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'ag-section-block';

    const isCatSelected = currentOrder.includes(sec.id);
    let catIcon = '';
    if(isCatSelected) {
       catIcon = currentMode === 'dynamic' ? ' <span style="font-size:10px; opacity:0.6; margin-left:5px">✕</span>' : ' <span style="font-size:10px; opacity:0.6; margin-left:5px">•••</span>';
    }

    sectionDiv.innerHTML = `
      <button class="ag-section-header-btn ${isCatSelected ? 'is-active' : ''}" data-cat-id="${sec.id}">
        <div class="ag-section-marker" style="background:${sec.cor}"></div>
        <span class="ag-section-text">${sec.sessao}${catIcon}</span>
      </button>
      <div class="ag-grid-container"></div>
    `;

    sectionDiv.querySelector('.ag-section-header-btn').onclick = (e) => {
        if(isCatSelected && currentMode === 'fixed') {
             handleAction(sec.id, sec.sessao);
        } else {
             toggleItem(sec.id, sec.sessao);
        }
    };

    container.appendChild(sectionDiv);
    const grid = sectionDiv.querySelector('.ag-grid-container');

    itensParaMostrar.forEach(item => {
      const isSelected = currentOrder.includes(item.id);

      const card = document.createElement('div');
      card.className = `ag-card ${isSelected ? 'is-selected' : ''}`;

      let actionIcon = '';
      if(isSelected) {
        actionIcon = currentMode === 'dynamic' ? '✕' : '•••';
      }

      card.innerHTML = `
        ${item.label}
        ${isSelected ? `<div class="ag-card-action" data-id="${item.id}" data-action="true">${actionIcon}</div>` : ''}
      `;

      card.onclick = (e) => {
        if(e.target.dataset.action || e.target.parentNode.dataset.action) {
          e.stopPropagation();
          handleAction(item.id, item.label);
          return;
        }
        toggleItem(item.id, item.label);
      };

      grid.appendChild(card);
    });
  });

  const searchInput = document.getElementById('ag-search-input');
  searchInput.oninput = (e) => {
    filterDrawer(e.target.value);
  };

  document.getElementById('btn-fixo').onclick = () => setMode('fixed');
  document.getElementById('btn-dinamico').onclick = () => setMode('dynamic');
}

// Função para filtrar os elementos existentes, sem recriar o drawer
function filterDrawer(term) {
  const termLower = term.toLowerCase();
  document.querySelectorAll('.ag-section-block').forEach(block => {
    const catId = block.querySelector('.ag-section-header-btn').dataset.catId;
    const cat = CATALOGO.find(c => c.id === catId);
    if (!cat) return;

    const sessaoMatch = cat.sessao.toLowerCase().includes(termLower);
    const itensFiltrados = cat.itens.filter(i => i.label.toLowerCase().includes(termLower));
    const grid = block.querySelector('.ag-grid-container');
    const headerBtn = block.querySelector('.ag-section-header-btn');

    if (termLower !== "" && !sessaoMatch && itensFiltrados.length === 0) {
      block.style.display = 'none';
      return;
    }
    block.style.display = '';

    grid.querySelectorAll('.ag-card').forEach(card => {
      const label = card.textContent.trim();
      if (label.toLowerCase().includes(termLower) || sessaoMatch) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

/* ===========================
   AÇÕES & NOTIFICAÇÕES
=========================== */
function toggleItem(id, label){
  let order = getOrder();

  if(order.includes(id)){
    order = order.filter(x => x !== id);
    showToast(`Removido: <b>${label}</b>`, 'normal');
  } else {
    if(order.length >= CONFIG.MAX_TABS) {
      showToast(`Limite de ${CONFIG.MAX_TABS} abas atingido!`, 'error');
      return;
    }
    order.push(id);
    showToast(`Adicionado: <b>${label}</b>`, 'success');
  }

  save(CONFIG.KEYS.ORDER, order);
  renderBar();

  // AUTO-CLIQUE MANTIDO - Clica automaticamente na categoria adicionada
  setTimeout(() => {
    const button = document.querySelector(`#filterScroller .filter-tag[data-id="${id}"]`);
    if (button) {
      button.click();
    }
  }, 100);
}

function handleAction(id, label){
  const mode = getMode();
  let order = getOrder();

  if(mode === 'dynamic') {
    order = order.filter(x => x !== id);
    save(CONFIG.KEYS.ORDER, order);
    showToast(`Removido: <b>${label}</b>`);
    renderBar();
    const currentInput = document.getElementById('ag-search-input');
    const currentValue = currentInput ? currentInput.value : '';
    renderDrawer(currentValue);
    if (currentInput) currentInput.value = currentValue;
  } else {
    const currentIndex = order.indexOf(id);
    const newPos = prompt(`Mover "${label}" para qual posição? (1-${order.length})`, currentIndex + 1);

    if(newPos !== null){
      const targetIndex = parseInt(newPos) - 1;
      if(!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < order.length) {
        order.splice(currentIndex, 1);
        order.splice(targetIndex, 0, id);
        save(CONFIG.KEYS.ORDER, order);
        renderBar();
        const currentInput = document.getElementById('ag-search-input');
        const currentValue = currentInput ? currentInput.value : '';
        renderDrawer(currentValue);
        if (currentInput) currentInput.value = currentValue;
        showToast(`<b>${label}</b> movido para posição ${newPos}`);
      }
    }
  }
}

/* ===========================
   FUNÇÃO: Garante que a aba exista no order
=========================== */
function ensureTabExists(id){
  const exists = CATALOGO.some(sec => sec.id === id || sec.itens.some(i => i.id === id));
  if (!exists) return false;

  let order = getOrder();
  if (!order.includes(id)) {
    if (order.length >= CONFIG.MAX_TABS) {
      order.pop();
    }
    order.unshift(id);
    save(CONFIG.KEYS.ORDER, order);
  }
  return true;
}

/* ===========================
   CARREGAMENTO DE SEÇÃO POR URL (Deep Linking & Params)
=========================== */
window.addEventListener('DOMContentLoaded', () => {
  renderBar();

  // Nova Lógica de Detecção de URL
  const params = new URLSearchParams(window.location.search);
  const newsId = params.get('id');
  const secaoForcada = params.get('secao');
  
  // 1. Prioridade: ID da Notícia (Link Compartilhado)
  if (newsId) {
    // IMPORTANTE: Aqui definimos a coleção onde estão as notícias.
    // Como no seu arquivo HTML você usou 'saihate_no_paladin' como coleção principal,
    // forçamos a abertura dessa aba.
    const abaAlvo = 'saihate_no_paladin';
    
    // Garante que a aba esteja na lista de abas ativas e renderiza
    if(ensureTabExists(abaAlvo)) {
        renderBar(); 
        // Pequeno delay para garantir que o DOM renderizou o botão antes de clicar
        setTimeout(() => {
            const btn = document.querySelector(`#filterScroller .filter-tag[data-id="${abaAlvo}"]`);
            if(btn) {
                // Remove seleção visual das outras e ativa esta
                document.querySelectorAll('#filterScroller .filter-tag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Se o script de notícias expõe a função global, chama direto
                if (window.carregarSecao) {
                    window.carregarSecao(abaAlvo);
                } else {
                    // Fallback: Clica fisicamente no botão
                    btn.click();
                }
            }
        }, 200);
    }
    return; // Encerra aqui para não conflitar com a lógica de seção normal
  }

  // 2. Prioridade: Seção Específica (Parâmetro antigo ?secao=)
  if (secaoForcada) {
    if(ensureTabExists(secaoForcada)) {
        renderBar();
        setTimeout(() => {
            const btn = document.querySelector(`#filterScroller .filter-tag[data-id="${secaoForcada}"]`);
            if (btn) {
                document.querySelectorAll('#filterScroller .filter-tag').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                btn.click();
            } else if (window.carregarSecao) {
                window.carregarSecao(secaoForcada);
            }
        }, 150);
    }
  }
});

})();
