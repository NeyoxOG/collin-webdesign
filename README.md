# Collin Jeske — Webdesign auf Cloudflare Pages

Verkaufswebsite mit animiertem Frontend, Anfrageformular, Cloudflare D1 und geschütztem Adminbereich unter `/admin/`.

## Angebot
- Website: **25 €**
- Standardmäßig Veröffentlichung über eine verfügbare `*.pages.dev`-Adresse
- Eine eigene Domain ist nicht im Preis enthalten; die technische Einrichtung kann auf Anfrage übernommen werden.
- Portfolio: https://collinjeske.pages.dev

## Sicherheit
- Das Admin-Passwort ist **nicht** im Frontend oder in diesem Repository enthalten.
- Cloudflare-Secret `ADMIN_PASSWORD` enthält das Admin-Passwort.
- Cloudflare-Secret `SESSION_SECRET` signiert die HttpOnly-Session.
- Nach 5 falschen Loginversuchen wird die IP 15 Minuten gesperrt.
- Anfragen werden serverseitig gespeichert und nur nach gültiger Session ausgeliefert.

## Cloudflare Pages Einrichtung
1. Dieses GitHub-Repository als Cloudflare-Pages-Projekt verbinden.
2. D1-Datenbank `collin-webdesign-requests` verwenden.
3. Im Pages-Projekt unter **Bindings** eine D1-Bindung mit dem Variablennamen `DB` auf diese Datenbank setzen.
4. Den Inhalt von `schema.sql` einmal in der D1-Konsole ausführen.
5. Im Pages-Projekt die verschlüsselten Secrets setzen:
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET` (lange zufällige Zeichenfolge)
6. Neu deployen.

`wrangler.toml` enthält absichtlich keine feste D1-Datenbank-ID, damit keine account-spezifische UUID im Repository gepflegt werden muss. Das Binding wird im Cloudflare-Dashboard gesetzt.
