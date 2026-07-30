# footprint_percelen v1.0.0

Klopt het perceel bij dit rijksmonument? Deze eerste release beantwoordt precies die vraag, in één oogopslag, zonder ergens zelf tussen twee registers te hoeven schakelen.

## Wat het doet

Uitbreiding op [footprint](https://github.com/jolietjakeblues/footprint): naast pandoppervlakte en NEN2580-gebruiksoppervlakte (zoals v1 al deed) toont deze versie ook het kadastrale perceel, alle publiekrechtelijke beperkingen (BRK-PB/WKPB) daarop, en de oorspronkelijke functie van het monument.

**De kern van deze release: de perceelcheck.** De app vergelijkt de kadastrale aanduiding die het Rijksmonumentenregister (RCE) voor een monument registreert met het perceel dat het Kadaster daadwerkelijk op die locatie heeft, en toont per aanduiding een status:
- ✓ komt overeen
- ? mogelijk verouderd (perceel is sindsdien mogelijk hernummerd)
- ! komt niet overeen (waarschijnlijk een fout in de brongegevens)
- × niet gevonden in Kadaster
- – geen kadastrale koppeling bij RCE

Heeft een monument meerdere kadastrale aanduidingen (komt vaker voor dan je zou denken), dan krijgt elke aanduiding zijn eigen regel met status en afstand, nooit een verzameltekst die verhult dat er meerdere percelen in het spel zijn.

## Zoeken op

- **Adres**, via de PDOK Locatieserver.
- **Rijksmonumentnummer**, met automatische koppeling naar adres én kadastrale aanduiding(en).
- **Kadastrale aanduiding** (bv. `F 3945`), inclusief een keuzelijst met filter wanneer sectie+perceelnummer landelijk meerdere treffers oplevert (dat gebeurt vaker dan je zou denken).

## Databronnen

BAG (PDOK), Kadaster Kennisgraaf (KKG, SPARQL) en RCE Cultureel Erfgoed (CHO, SPARQL), allemaal rechtstreeks vanuit de browser bevraagd. Eén statisch HTML-bestand, geen build-stap, geen backend, geen sleutels.

## Bekende beperkingen

- RCE's geregistreerde gemeentenaam is vaak een historische kadastrale gemeentenaam, niet de huidige bestuurlijke gemeente, de perceelcheck zoekt daarom altijd landelijk op sectie+perceelnummer.
- Er bestaat geen expliciete opvolgrelatie tussen een hernummerd/gesplitst perceel en zijn opvolger; de app valt dan terug op een afstandsvergelijking.
- Omgevingsplan/bestemmingsplan-regels zijn bewust niet toegevoegd: de beschikbare open-databronnen bieden geen betrouwbare, perceel-specifieke ontsluiting daarvan (alleen documentmetadata of een generieke link).

## Licentie

MIT.
