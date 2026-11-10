# OutdoorKeuze.nl

Een statische vergelijkingswebsite voor outdoorproducten. Gebouwd met HTML, CSS en JavaScript. Geen database, geen betaalde diensten.

## Mappenstructuur

```
outdoorkeuze/
├── index.html            Homepage
├── vergelijkingen.html   Productvergelijkingen (filter op categorie en zoekterm)
├── artikelen.html        Artikelen en koopgidsen
├── over-ons.html
├── contact.html
├── privacy.html          Privacyverklaring
├── affiliate.html        Affiliateverklaring
├── css/
│   └── style.css         Alle stijlen (kleuren bovenin in :root)
├── js/
│   └── main.js           Header, footer, kaarten, filters
├── data/
│   ├── producten.json    Productgegevens (nu nog demonstratiegegevens)
│   └── artikelen.json    Artikelen en koopgidsen
└── images/               Eigen foto's (zie images/README.md)
```

## Lokaal bekijken

Dubbelklikken op `index.html` werkt meestal niet, omdat de browser de JSON-bestanden dan blokkeert. Gebruik een lokale server:

1. Open een terminal in de map `outdoorkeuze`.
2. Start een server met: `python -m http.server 8000`
3. Open in je browser: `http://localhost:8000`

## Online zetten via GitHub Pages (gratis)

1. Maak op github.com een nieuwe repository aan, bijvoorbeeld `outdoorkeuze`.
2. Upload alle bestanden en mappen uit deze map.
3. Ga naar **Settings > Pages**.
4. Kies bij **Source** de optie "Deploy from a branch", kies `main` en map `/ (root)`.
5. Na een minuut of twee staat de site op `https://<jouwnaam>.github.io/outdoorkeuze/`.

Een eigen domein zoals outdoorkeuze.nl kun je later koppelen via de instellingen van GitHub Pages.

## Producten aanpassen

Alle productgegevens staan in `data/producten.json`. Per product vul je in:

- `naam`, `merk`, `categorie` (`kamperen`, `wandelen`, `outdoor` of `uitrusting`) en `subcategorie`
- `prijs`: een getal zoals `49.95`, of `null` als de prijs nog niet bekend is
- `eigenschappen`, `voordelen`, `nadelen`: lijsten met tekst
- `affiliate_url`: de echte affiliatelink
- `affiliate_status`: zet dit op `"live"` zodra de link echt is, dan verdwijnt de placeholder-melding

Zet `"uitgelicht": true` om een product op de homepage te tonen (maximaal drie).

## Artikelen toevoegen

Voeg een blok toe aan `data/artikelen.json` met `id`, `type` (`artikel` of `koopgids`), `titel`, `datum`, `samenvatting` en `inhoud` (een lijst met alinea's). Gebruik een unieke `id` zonder spaties.

## Affiliatelinks, eerlijk gebruik

- De huidige links zijn placeholders en leiden nergens naartoe. Vervang ze pas door echte affiliatelinks.
- Houd de affiliateverklaring en de privacyverklaring up-to-date en laat ze controleren.
- Verzin geen prijzen, eigenschappen of ervaringen. Zolang een product `"Demo"` toont, zijn de gegevens voorbeelden.

## Later toe te voegen

- Echte productfoto's in `images/`
- Nieuwsbriefformulier (nu uitgeschakeld, verzamelt geen gegevens)
- Database of content-systeem, zodra het aantal producten groeit

## Campings uit OpenStreetMap

Het bestand `data/campings-osm.json` bevat campings en kampeerterreinen uit OpenStreetMap. Een GitHub-workflow (`.github/workflows/campings-bijwerken.yml`) werkt dit bestand elke maand bij via `scripts/haal_campings_op.py`. Je kunt de workflow ook handmatig starten via het tabblad **Actions**.

Let op de licentie: de gegevens komen uit OpenStreetMap en vallen onder de **ODbL**. Vermeld daarom altijd de bron (*© OpenStreetMap-bijdragers*), zoals op de kaartpagina. Als je de dataset zelf verspreidt, geldt de ODbL ook voor die dataset.

## Tests

De databestanden in `data/` worden gecontroleerd met Node's ingebouwde testrunner (geen installatie nodig, Node 18 of hoger):

```
npm test
```

De tests controleren onder meer op dubbele id's, geldige categorieën en niveaus, coördinaten binnen Nederland, en of placeholder-producten geen prijs of echte affiliate-link hebben.
