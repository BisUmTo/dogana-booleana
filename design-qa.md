# Verifica grafica e funzionale — 25 settembre 2026

## Riferimenti e condizioni
- Fonte: `design/approved-mobile.png`, 853 × 1844 pixel.
- Implementazione: `design/qa/game-level8-bits-final.png`, 390 × 844 pixel; viewport CSS 390 × 844, acquisizione 1:1.
- Confronto normalizzato: `design/qa/comparison-bits-final.png`. Il riferimento viene ridotto alla dimensione CSS dell’implementazione; nessuna cornice del dispositivo.
- Dettaglio cartello/header: `design/qa/comparison-rule-detail.png`.
- Stato comparato: livello 8, tre vite, regola cappello AND (badge OR cravatta) AND NOT occhiali, decisione attiva. Ospite e contesto variano intenzionalmente; la notazione & | ! sostituisce quella del mockup su richiesta dell’utente.

## Findings e iterazioni
Nessun problema P0/P1/P2 aperto nel confronto finale.

1. P2: header troppo alto e personaggio troppo piccolo nella prima versione. Ridotte le altezze dell’header e aumentata la scala del personaggio. Evidenza prima: `game-level8-mobile.png`; dopo: `game-level8-bits-final.png`.
2. P2: operatori isolati a fine riga nelle regole complesse. Raggruppati operatore e operando, mantenendo parentesi visibili. Evidenza: `level20-small-final.png` e screenshot finale del livello 8.
3. P2: su schermi bassi, comandi fuori schermo e parte dell’ultima riga della regola tagliata. Layout limitato al viewport, area regola fino al 32% dell’altezza e personaggio ritagliato sulle gambe. Prima: `level20-small.png`; dopo: `level20-small-final.png`, 320 × 568, altezza contenuto regola uguale all’area disponibile. L’eventuale scorrimento della regola viene esplicitamente indicato.
4. Revisione richiesta dall’utente: ridotte le impostazioni a Simboli, Audio, Animazioni. Opzioni didattiche trasferite in Allenamento separato. Evidenza: `settings-simple.png`, `report-training-separated.png`.

## Cinque superfici verificate
- **Tipografia:** Anton locale per titolo/display, testo di lettura Avenir/Arial. Titolo condensato coerente con il mockup; gerarchia regola/ospite/azioni chiara. Nessun testo troncato negli stati verificati. Il titolo più compatto riserva spazio agli accessori.
- **Spaziatura e layout:** cartello fisso sopra al personaggio, azioni persistenti in basso. Mobile 390 × 844 e 320 × 568; desktop 1366 × 900 e landscape 667 × 375. Nessun comando essenziale nascosto. La regola semplice occupa una riga e lascia più spazio al personaggio.
- **Colori:** viola scuro, crema/oro, corallo e turchese conservano la direzione del mockup. Testo scuro sui pulsanti migliora il contrasto rispetto al testo bianco del riferimento. Stato non comunicato dal solo colore: testo, icona e numero accompagnano sempre il feedback.
- **Immagini:** tutti i 20 sfondi originali sono presenti e coerenti; ispezionato `backgrounds-montage.png`. Nessun placeholder. Personaggi SVG modulari originali e icone condivise sono una scelta esplicitamente richiesta dall’utente: non riproducono la pittura raster del personaggio nel mockup. Accessori indipendenti e pattern distinguibili; cappello generico neutro per non suggerire una condizione colore inesistente.
- **Contenuti:** italiano, 0 respingi / 1 ammetti, nessuna lettera variabile, default & | !. Timer assente nei primi quattro livelli; tre vite. Aiuto e pausa aggiunti per uso didattico. Nome del contesto e contatore ospiti rendono leggibile la progressione.

## Interazioni e regressioni
- Eseguiti tutti i 20 livelli, avanzamento infinito 21/22, ripasso, swipe nelle due direzioni e tastiera 0/1.
- Verificati errore, tre vite/game over, timeout, pausa, aiuto, ripresa dopo ricaricamento e conservazione delle risposte.
- Con nuovo profilo, completare Allenamento 20 non sblocca il percorso o l’Infinito; completare Gioco 1 conserva i risultati separati.
- Scaricato un LOG reale misto: decifrati 8 tentativi di gioco e 8 di allenamento; reimportando lo stesso file, 16 duplicati ignorati.
- 51 test automatici passano, inclusi snapshot delle impostazioni e migrazione di turni storici personalizzati.
- Console browser controllata. Nessun errore applicativo rilevato.

## Limiti e follow-up
L’automazione dell’upload file nel browser è stata negata dal sistema dei permessi. Non è stata aggirata. Cifratura, decifratura, importazione, filtri e CSV sono verificati con test e LOG realmente scaricati; il selettore nativo di upload resta da provare manualmente sul dispositivo docente.

P3 opzionale: ulteriore rifinitura delle espressioni facciali e variazioni dei gesti, senza modificare la leggibilità degli attributi.

## Checklist
- [x] Confronto completo e dettaglio del cartello.
- [x] Controlli mobile, desktop, landscape e schermo piccolo.
- [x] Correzioni P0/P1/P2 ricontrollate.
- [x] Nuove impostazioni e separazione Gioco/Allenamento verificate.

final result: passed
