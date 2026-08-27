# Collin Jeske — Cloudflare Pages Website

Verkaufswebsite mit animiertem Frontend, Anfrageformular, D1-Speicherung und geschütztem Adminbereich unter `/admin/`.

## Sicherheit
- Das Admin-Passwort ist **nicht** im Frontend oder Repository enthalten.
- Es wird als Cloudflare-Secret `ADMIN_PASSWORD` gesetzt.
- `SESSION_SECRET` signiert die HttpOnly-Session und sollte eine lange zufällige Zeichenfolge sein.
- Login-Sperre nach 5 Fehlversuchen für 15 Minuten.
- Anfragen werden nur nach gültiger serverseitiger Session ausgeliefert.

## Cloudflare-Einrichtung
1. Pages-Projekt `collin-webdesign` anlegen bzw. dieses Projekt verbinden.
2. D1-Datenbank `collin-webdesign-requests` erstellen.
3. Die D1-ID in `wrangler.toml` einsetzen.
4. `schema.sql` auf die D1-Datenbank anwenden.
5. Im Pages-Projekt zwei verschlüsselte Secrets setzen:
   - `ADMIN_PASSWORD` = das gewünschte Admin-Passwort
   - `SESSION_SECRET` = eine lange zufällige Zeichenfolge
6. Deployen. Ohne eigene Domain bleibt die Seite unter der verfügbaren `*.pages.dev`-Adresse erreichbar.

## Domain
Eine eigene Domain ist bewusst nicht Bestandteil des 25-€-Angebots. Sie kann später über Cloudflare Pages als Custom Domain verbunden werden. Die Domain sollte dem Kunden gehören.

## Lokal
Für eine lokale Vorschau der statischen Seite reicht ein lokaler Webserver im `public`-Ordner. Für Login/Formular benötigt die Vorschau Pages Functions + D1-Konfiguration.
