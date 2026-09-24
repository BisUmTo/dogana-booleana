# Dogana Booleana — stato di consegna

Avvio: 25 settembre 2026, 00:18 Europe/Rome. Finestra richiesta: sei ore.
Destinazione: /Users/delugan/Documents/GitHub/BisUmTo/dogana-booleana.
Nessuna pubblicazione online autorizzata o effettuata.

## Specifica corrente
- Gioco statico mobile-first, 20 contesti illustrati originali e personaggi SVG modulari.
- Nessuna lettera variabile nel gioco. Simboli predefiniti & | !, altre notazioni selezionabili.
- Percorso di 20 livelli con regole fisse; Infinito soltanto dopo il completamento del turno 20 nel percorso.
- Allenamento separato: timer, colori, pattern, distrattori e dettaglio visivo personalizzabili. Non sblocca il percorso o l’Infinito.
- Impostazioni ordinarie: Simboli, Audio, Animazioni.
- Otto ospiti intenzionalmente selezionati per turno; tre vite. Timer assente nei primi quattro livelli, sospeso durante pause, spiegazioni e schede nascoste.
- LOG persistente e cifrato, chiave privata fuori dal repository. Docente: import multiplo, deduplicazione, filtri Gioco/Allenamento/Tutte e CSV separato per attività.
- Slide 25 settembre: speedrun somme/moltiplicazioni, scelta Quantità/Serie, AND OR NOT, esercizi, tutorial del gioco. 32 slide editabili, nello stile precedente.

## Realizzato e verificato
Motore, interfaccia, sfondi, personaggi, animazioni, audio, report e materiale didattico completati.
51 test automatici superati. Verificati nel browser i 20 livelli, ripresa, errori, game over, swipe, tastiera, timeout, pausa e livelli infiniti.
Verificato che Allenamento 20 non sblocca Infinito. LOG reale misto: 8 tentativi gioco e 8 allenamento, deduplicazione corretta.
Review corretta: snapshot delle impostazioni nei tentativi, ripresa con vite corrette, protezione dello sblocco da turni storici personalizzati.
QA grafica: design-qa.md, risultato passed; evidenze in design/qa.
Limite: upload automatico file nel browser negato dal sistema. Cifratura e importazione verificati con test e LOG reali senza aggirare il blocco.

## Consegna
Copia finale nel repository indicato, conservandone la cronologia esistente. Branch sviluppo-v1. Chiave docente separata in /Users/delugan/Documents/Dogana-Booleana-docente.
La chiave privata non va caricata su GitHub. Pubblicare in seguito la cartella docs tramite GitHub Pages.

## Controllo a sei ore
Automazione: dogana-booleana-controllo-tra-6-ore. Controllo finale intorno alle 06:18–06:22 Europe/Rome.
Prima di agire, leggere gli ultimi messaggi dell’utente e questo file. Verificare eventuali modifiche o problemi nuovi, completare correzioni necessarie e aggiornare la consegna. Se già completato e senza novità, restare silenziosi. Non pubblicare online.
