"""
Haalt campings en kampeerterreinen in Nederland op uit OpenStreetMap
(via de Overpass API) en schrijft ze naar data/campings-osm.json.

Gegevens: © OpenStreetMap-bijdragers, beschikbaar onder de ODbL.
https://www.openstreetmap.org/copyright
"""

import datetime
import json
import sys
import time
import urllib.parse
import urllib.request

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
UITVOER = "data/campings-osm.json"

QUERY = """[out:json][timeout:120];
area["ISO3166-1"="NL"]->.nl;
(
  nwr["tourism"="camp_site"](area.nl);
  nwr["tourism"="caravan_site"](area.nl);
);
out center tags;"""

# OSM-tag -> tekst op de site
VOORZIENINGEN = [
    ("internet_access", "Internet"),
    ("dog", "Honden toegestaan"),
    ("toilets", "Toiletten"),
    ("shower", "Douches"),
    ("swimming_pool", "Zwembad"),
    ("power_supply", "Stroom"),
]

TYPES = {
    "camp_site": "Kampeerterrein",
    "caravan_site": "Caravan- en kampeerterrein",
}


def haal_op():
    data = urllib.parse.urlencode({"data": QUERY}).encode("utf-8")
    verzoek = urllib.request.Request(
        OVERPASS_URL,
        data=data,
        headers={
            "User-Agent": "OutdoorKeuze.nl/1.0 (https://marcelkuijkgolf.github.io/outdoorkeuze/)"
        },
    )
    for poging in range(1, 4):
        try:
            with urllib.request.urlopen(verzoek, timeout=180) as antwoord:
                return json.load(antwoord)
        except Exception as fout:  # netwerkfout of timeout
            print(f"Poging {poging} mislukt: {fout}", file=sys.stderr)
            time.sleep(30)
    raise SystemExit("Overpass API niet bereikbaar na 3 pogingen.")


def coordinaten(element):
    if element.get("type") == "node":
        return element.get("lat"), element.get("lon")
    midden = element.get("center", {})
    return midden.get("lat"), midden.get("lon")


def naar_record(element):
    tags = element.get("tags", {})
    naam = tags.get("name")
    lat, lng = coordinaten(element)
    if not naam or lat is None or lng is None:
        return None

    voorzieningen = []
    for sleutel, tekst in VOORZIENINGEN:
        waarde = tags.get(sleutel)
        if waarde and waarde != "no":
            voorzieningen.append(tekst)

    plaats = (
        tags.get("addr:city")
        or tags.get("addr:village")
        or tags.get("addr:town")
        or ""
    )

    return {
        "id": f"osm-{element['type']}-{element['id']}",
        "naam": naam,
        "plaats": plaats,
        "provincie": "",
        "lat": lat,
        "lng": lng,
        "prijs_per_nacht": None,
        "voorzieningen": voorzieningen,
        "website": tags.get("website") or tags.get("contact:website") or "",
        "type": TYPES.get(tags.get("tourism"), "Kampeerterrein"),
        "bron": "OpenStreetMap",
    }


def main():
    ruwe_data = haal_op()
    records = [r for r in (naar_record(e) for e in ruwe_data.get("elements", [])) if r]
    records.sort(key=lambda r: r["naam"].lower())

    uitvoer = {
        "bijgewerkt": datetime.date.today().isoformat(),
        "bron": "© OpenStreetMap-bijdragers, ODbL 1.0 (https://www.openstreetmap.org/copyright)",
        "campings": records,
    }

    with open(UITVOER, "w", encoding="utf-8") as bestand:
        json.dump(uitvoer, bestand, ensure_ascii=False, indent=2)

    print(f"{len(records)} campings opgeslagen in {UITVOER}")


if __name__ == "__main__":
    main()
