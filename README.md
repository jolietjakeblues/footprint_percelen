# footprint_percelen

Uitbreiding op [footprint](https://github.com/jolietjakeblues/footprint): naast de pandoppervlakte (BAG) toont deze versie ook het kadastrale perceel, alle publiekrechtelijke beperkingen (BRK-PB/WKPB) op dat perceel, en een controle of de kadastrale aanduiding die het Rijksmonumentenregister (RCE) registreert nog overeenkomt met het actuele perceel bij het Kadaster.

Eén statisch HTML-bestand, geen build-stap, geen backend, alle data wordt rechtstreeks vanuit de browser opgehaald.

## Zoeken op

- **Adres**, via de PDOK Locatieserver, zoals in v1. Het perceel wordt bij voorkeur herleid via het `gekoppeld_perceel`-veld dat PDOK al meegeeft; alleen als dat ontbreekt valt de app terug op een postcode+huisnummer-zoekopdracht in de Kadaster Kennisgraaf (niet elk adres heeft een postcode, en niet elk adres staat daar met een directe koppeling in).
- **Rijksmonumentnummer**, haalt bij RCE zowel de BAG-koppeling (adres) als de BRK-koppeling(en) (kadastrale aanduiding) op, en toont het nummer met een link naar de specifieke pagina in het monumentenregister (opent in een nieuw tabblad). Toont ook de oorspronkelijke functie (`ceo:heeftOorspronkelijkeFunctie`) naast het huidige BAG-gebruiksdoel.
- **Kadastrale aanduiding** (bv. `F 3945`), zoekt landelijk in de Kadaster Kennisgraaf. Omdat sectie+perceelnummer niet landelijk uniek is, toont de app bij meerdere treffers een keuzelijst (met filter) in plaats van automatisch de eerste te kiezen.

Als het adres zelf geen perceel oplevert maar de perceelcheck (zie hieronder) via RCE wél een betrouwbare match vindt, toont de app dat perceel alsnog, met een duidelijke toelichting dat het niet rechtstreeks via het adres is gevonden.

## Databronnen

- **BAG**, PDOK WFS (pandgeometrie, gebruiksoppervlakte NEN2580).
- **Kadaster Kennisgraaf (KKG)**, SPARQL (`api.labs.kadaster.nl`), ontologie `imxgeo`: percelen, kadastrale grootte, geometrie, en publiekrechtelijke beperkingen.
- **RCE Cultureel Erfgoed (CHO)**, SPARQL (`api.linkeddata.cultureelerfgoed.nl`), ontologie `ceo`: rijksmonumentgegevens, BAG- en BRK-relaties.

## De perceelcheck

Vergelijkt de kadastrale aanduiding die RCE voor een rijksmonument registreert met het perceel dat Kadaster daadwerkelijk op die locatie heeft. Mogelijke uitkomsten:

- **Komt overeen**, exacte match, of coördinaten binnen 50 m van elkaar.
- **Mogelijk verouderd**, 50 m–1 km verschil: kan een reorganisatie van percelen zijn, handmatig te beoordelen.
- **Komt niet overeen**, meer dan 1 km verschil: waarschijnlijk een fout in de brongegevens.
- **Niet gevonden**, de aanduiding bestaat niet meer in Kadaster (bv. door hernummering; er bestaat geen expliciete opvolgrelatie tussen oude en nieuwe percelen).
- **Geen kadastrale koppeling bij RCE**, er is domweg geen BRK-relatie geregistreerd voor dit monument.

Een rijksmonument kan méér dan één kadastrale aanduiding bij RCE hebben (bv. een pand dat meerdere percelen beslaat). De perceelcheck toont dan een regel per aanduiding, elk met eigen status en afstand, plus een samenvatting ("N van M komen overeen"), het is dus altijd zichtbaar wanneer RCE meerdere percelen registreert en welke daarvan wel of niet kloppen.

Bekende beperking: RCE's gemeentenaam bij een BRK-relatie is vaak een historische *kadastrale* gemeentenaam (er zijn/waren zo'n 2900 van), niet de huidige bestuurlijke gemeente (~342). Na gemeentelijke herindelingen komen die namen niet meer overeen, de perceelcheck zoekt daarom landelijk op sectie+perceelnummer en negeert RCE's gemeentenaam als zoekfilter.

## Draaien

Statisch bestand, geen dependencies om te installeren. Open `index.html` via een lokale webserver (bv. `python -m http.server`) of host het op GitHub Pages.

## Licentie

MIT, zie [LICENSE](LICENSE).
