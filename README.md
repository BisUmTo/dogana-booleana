# Dogana Booleana

Un controllo accessi con regole assurde per imparare **AND (`&`), OR inclusivo (`|`) e NOT (`!`)**. Gioco didattico in italiano, mobile-first, interamente statico.

## Giocare

Apri il sito, inserisci nome e classe e inizia il turno. Il cartello resta fisso per otto ospiti: scorri a sinistra o premi **0** per respingere; scorri a destra o premi **1** per ammettere. Da computer funzionano anche i tasti 0/1 e le frecce. Un errore o una risposta fuori tempo toglie una delle tre vite; una spiegazione mostra le condizioni dell'ospite.

Il percorso progressivo ha **20 livelli con regole fisse**. Fra un turno e l’altro, “Ripassa un livello” permette di tornare nei luoghi già sbloccati, conservando i tentativi nel report. La modalità **Infinita si sblocca soltanto dopo aver completato tutti i 20 livelli**.

I primi quattro livelli sono senza timer. Dal quinto il tempo dipende dalla complessità della regola e parte solo dopo l'arrivo dell'ospite. Pausa, spiegazioni e pagina nascosta fermano il tempo. Nel percorso progressivo il ritmo e le difficoltà seguono le regole del gioco. Per personalizzarli si usa lo spazio separato **Allenamento**.

Le regole usano **sempre icone, mai lettere**. Le icone degli accessori generici valgono per ogni colore; quando il colore è parte della condizione, il cappello o la camicia del cartello hanno quel colore preciso. Righe, pois e quadri si riferiscono alla camicia visibile al centro del busto. Le parentesi raggruppano condizioni e OR è inclusivo: entrambe vere va bene.

## Avvio locale

Dalla cartella del progetto:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory docs
```

Apri `http://127.0.0.1:8766/`. Non aprire `index.html` direttamente con doppio clic: i moduli e la cifratura richiedono un server locale o HTTPS. Non occorrono installazioni di pacchetti o una compilazione.

## Pubblicare su GitHub Pages

Il sito pronto è nella cartella **docs**. Crea il repository remoto e carica questa cartella di progetto. In GitHub → Settings → Pages scegli la pubblicazione dal branch desiderato e dalla cartella `/docs`. Il gioco usa percorsi relativi e funziona anche sotto un percorso di repository.

**La chiave privata docente è separata dal repository. Non copiarla in docs o su GitHub.** La chiave pubblica già presente deve restare abbinata a quella privata ricevuta: cambiarla renderebbe i vecchi LOG illeggibili con la nuova chiave.

## Consegna dei risultati

Lo studente apre *Il mio report* e scarica il LOG cifrato, poi lo allega a Classroom. Lo stesso export contiene tutti i tentativi conservati su quel dispositivo; può essere scaricato più volte. Il pannello docente elimina i doppioni. Il LOG distingue i tentativi del percorso e della modalità infinita dai tentativi di **Allenamento**: questi ultimi non sbloccano livelli e vanno interpretati separatamente.

Nome e classe restano associati ai tentativi. Per un dispositivo condiviso, usa *Cambia studente* dopo aver scaricato il lavoro precedente. Cancellare i dati del browser o usare una sessione privata può cancellare i risultati locali.

## Area docente

Apri `prof.html`, carica la chiave privata e seleziona insieme i LOG degli studenti. La decifratura avviene nel browser. Puoi filtrare per classe/nome, rivedere gli errori, confrontare accuratezza, serie, timeout e tempi, ed esportare un CSV. Leggi [la guida docente](GUIDA-DOCENTE.md) per interpretare i dati.

La chiave privata e i report importati restano soltanto nella memoria della scheda; il pannello non li invia e non li salva. Il CSV scaricato è in chiaro. Nome e classe uguali vengono riuniti: in caso di omonimia usare un identificativo concordato.

## Impostazioni essenziali

Nel gioco le impostazioni contengono soltanto **Simboli**, **Audio** e **Animazioni**. La notazione predefinita è `& | !`, usata anche nella lezione. Cambiare la notazione modifica la scrittura degli operatori, non la regola. Le caratteristiche continuano a essere rappresentate da icone, mai da lettere.

Audio controlla gli effetti e la musica originali sintetizzati con Web Audio. Il suono parte dopo un gesto dell’utente. Animazioni controlla il movimento dell’interfaccia.

## Allenamento separato

**Allenamento** permette di personalizzare timer, colori, pattern, distrattori e dettaglio visivo. Queste scelte riguardano soltanto l’allenamento: non modificano le regole del percorso progressivo.

Le risposte di Allenamento vengono conservate nel LOG con una classificazione distinta. Non fanno avanzare il percorso, non sbloccano livelli e non sbloccano la modalità infinita. Per leggere i risultati, confrontare separatamente il percorso e l’allenamento, considerando le condizioni scelte.

## Contenuti

- 20 ambientazioni illustrate originali e ospiti vettoriali modulari.
- 20 livelli progressivi con regole fisse; modalità infinita dopo il completamento di tutti i livelli.
- Casi validi, non validi, quasi validi, OR con entrambe le condizioni vere e negazioni.
- Ripasso dei livelli già sbloccati tra un turno e l’altro.
- Salvataggio locale e ripresa anche dopo un errore, senza duplicare la risposta.

## Limiti dei report

La cifratura ibrida RSA-OAEP/AES-GCM protegge la riservatezza dei LOG, **non certifica che un dispositivo non abbia inventato i dati**. La chiave pubblica è necessariamente disponibile nel sito. Il pannello valida le strutture e ricalcola i risultati, ma un'applicazione senza server non può garantire l'autenticità delle prestazioni.

Il tempo registrato è il tempo delle decisioni concluse con la pagina visibile, escluse pause e spiegazioni. Non prova l'attenzione e non include un esercizio lasciato incompleto. Evitare di interpretarlo come “ore di studio certe”.

## Sviluppo e verifiche

Con Node.js moderno:

```sh
node --test tests/*.test.mjs
```

`docs/core.mjs` contiene valutazione logica e casi; `characters.mjs` i vettori condivisi da ospiti e cartello; `app.mjs` il flusso; `crypto.mjs` la cifratura; `prof.mjs` l'importazione e i report. Tutto funziona senza dipendenze di runtime, CDN, analytics o account.

`tools/generate-key.mjs` serve solo per una nuova installazione con una nuova coppia: rifiuta di sovrascrivere chiavi esistenti e richiede che la chiave privata sia esterna al repository. Non eseguirlo per avviare il gioco già configurato.

Vedi [CREDITS.md](CREDITS.md) per l'origine degli asset e la licenza del carattere.
