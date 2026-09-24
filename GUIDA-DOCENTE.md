# Guida docente

## Una breve attività in classe

1. Mantieni i simboli predefiniti **`& | !`**. Inizia con una regola visiva semplice e fai esplicitare “presente = 1, assente = 0”.
2. Dopo NOT (`!`), chiedi agli studenti che cosa viene negato: una proprietà o un intero gruppo?
3. Al livello OR (`|`), mostra anche un ospite con entrambi gli accessori. È ammesso: OR non significa “esattamente uno”.
4. Con le parentesi, valuta prima i gruppi e poi il risultato complessivo.
5. Confronta gli errori e le motivazioni, non soltanto la rapidità. Gli accessori irrilevanti non devono cambiare la decisione.

Le lettere restano fuori dal gioco. Leggi `&` come “e”, `|` come “o, almeno una” e `!` come “non”. Le icone indicano le caratteristiche da osservare. Nella lezione su sequenze di bit, specifica sempre la larghezza: gli esercizi di NOT usano esattamente 4 bit. Il simbolo `!` è qui una convenzione didattica, non una sintassi universale per il complemento bit a bit nei linguaggi di programmazione.

Per la prima attività bastano il percorso progressivo e le tre impostazioni **Simboli, Audio, Animazioni**. Evita di introdurre subito tutte le possibilità di Allenamento.

## Percorso e Allenamento

Il percorso progressivo comprende **20 livelli con regole fisse**. Nei primi quattro non c’è timer; dal quinto il tempo per ospite segue il ritmo del gioco. Fra i turni si possono ripassare i livelli già sbloccati. **Infinita si sblocca solo dopo il completamento di tutti i 20 livelli.**

**Allenamento** è uno spazio separato. Qui si possono personalizzare timer, colori, pattern, distrattori e dettaglio visivo. Le personalizzazioni non alterano il percorso progressivo. I tentativi di Allenamento restano distinti nel LOG e non fanno avanzare o sbloccare livelli, né sbloccano Infinita.

Nel report separa le evidenze del percorso da quelle di Allenamento. Un’attività senza timer o con caratteristiche semplificate può aiutare a capire un errore, ma non è direttamente confrontabile con una prova del percorso svolta in condizioni diverse.

## Importazione dei LOG

- Lo studente scarica il file dal proprio report e lo consegna su Classroom.
- Apri l'area docente del sito e carica **chiave-privata-docente.json**, conservata separatamente dal repository pubblico.
- Seleziona più file LOG. Ogni file viene decifrato e verificato interamente prima di aggiungere i tentativi.
- Gli export successivi dello stesso studente possono sovrapporsi: le risposte con lo stesso identificativo vengono contate una volta sola. Un identificativo ripetuto con dati diversi causa il rifiuto dell'intero file.
- Filtra per classe o nome. Seleziona un nome per leggere gli errori, la regola, le caratteristiche registrate e l'uso dell'aiuto. Mantieni distinti i tentativi del percorso e quelli di Allenamento nell’interpretazione dei risultati.
- Esporta il CSV se vuoi lavorare sui dati in un foglio di calcolo. Conserva il CSV come gli altri documenti scolastici: contiene nomi e risultati leggibili.

La pagina non conserva chiavi o report alla chiusura. Il pulsante “Rimuovi chiave” impedisce altre decifrature ma lascia visibili i risultati già aperti; “Svuota report” rimuove anche quelli.

## Che cosa puoi osservare

| Dato | Evidenza utile | Limite interpretativo |
| --- | --- | --- |
| Corrette / tentativi | Accuratezza nella valutazione delle regole incontrate | Separare percorso e Allenamento; confrontare livelli e condizioni simili |
| AND, OR, NOT | Prestazioni nelle espressioni che contengono ciascun operatore | Una risposta può coinvolgere più operatori: non isola la padronanza di uno solo |
| Serie migliore | Continuità delle risposte corrette all'interno di un turno | Si azzera con errore, timeout o nuova sessione |
| Timeout | Difficoltà a decidere entro il tempo assegnato | Non equivale necessariamente a incomprensione |
| Tempo attivo | Tempo delle decisioni concluse in primo piano | Una pagina visibile può essere lasciata inattiva; non misura attenzione |
| Media corretti | Rapidità delle risposte corrette | Confrontare condizioni e difficoltà simili |
| Aiuto usato | Ricorso alla lettura della regola in parole | Usare l'aiuto è una strategia, non automaticamente un errore |
| Errori specifici | Condizioni confuse, negazioni, parentesi, OR inclusivo | Il log fornisce indizi: chiedere una breve motivazione allo studente |

## Competenze da verificare successivamente

Lo studente riconosce proprietà rilevanti e le associa a valori booleani, interpreta AND, OR inclusivo e NOT, rispetta il raggruppamento delle parentesi e valuta un'espressione composta senza farsi guidare da dettagli irrilevanti. Sa ricostruire un errore e spiegare perché una configurazione produce 0 oppure 1. La rapidità è una dimensione aggiuntiva: l'evidenza più solida combina accuratezza, varietà dei casi e spiegazione del ragionamento.

Per valutare una competenza, affianca al LOG una domanda breve o un esercizio su carta con una configurazione nuova. Non convertire automaticamente il tempo o il numero di partite in un voto.

## Colori, accessibilità e dispositivi

Se il colore o il ritmo costituiscono una barriera, usa **Allenamento** e adatta colori, pattern, distrattori, timer o dettaglio visivo. Queste personalizzazioni restano separate dalle regole fisse del percorso. Le animazioni e l’audio si regolano anche dalle impostazioni essenziali del gioco.

Il gioco offre nomi accessibili delle caratteristiche, comandi da tastiera e pulsanti grandi oltre agli swipe. Interpreta ogni tentativo di Allenamento insieme alle condizioni registrate nel LOG, senza usarlo come prova di completamento del percorso.

Su un dispositivo condiviso cambia studente solo dopo aver scaricato il LOG. Usa nomi/identificativi coerenti; nome e classe uguali vengono accorpati.

## Chiavi e affidabilità

Conserva una copia sicura della chiave privata. Il sito contiene soltanto la chiave pubblica. Non sostituire la coppia durante un'attività già iniziata: i LOG vecchi rimangono legati alla vecchia chiave.

Il sistema protegge la riservatezza e rileva file danneggiati o incoerenti. Non è una certificazione contro la falsificazione: in un gioco soltanto frontend, chi controlla il dispositivo può costruire dati artificiali. Usa i report come evidenze didattiche, insieme alle osservazioni in classe.
