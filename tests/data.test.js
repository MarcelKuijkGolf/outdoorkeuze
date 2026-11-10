// Controleert de databestanden in data/. Geen externe afhankelijkheden.
// Draaien: npm test  (of: node --test tests/)

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const DATA = path.join(__dirname, '..', 'data');

function laad(naam) {
  return JSON.parse(fs.readFileSync(path.join(DATA, naam), 'utf-8'));
}

const CATEGORIEEN = ['kamperen', 'wandelen', 'outdoor', 'uitrusting'];
const NIVEAUS = ['instap', 'gevorderd', 'expert'];
const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;

function dubbeleIds(lijst) {
  const gezien = new Set();
  const dubbel = [];
  for (const item of lijst) {
    if (gezien.has(item.id)) dubbel.push(item.id);
    gezien.add(item.id);
  }
  return dubbel;
}

test('producten: geldige structuur en waarden', () => {
  const producten = laad('producten.json');
  assert.ok(Array.isArray(producten) && producten.length > 0);
  assert.deepEqual(dubbeleIds(producten), []);

  for (const p of producten) {
    assert.ok(p.naam && p.naam.trim(), `${p.id}: naam ontbreekt`);
    assert.ok(CATEGORIEEN.includes(p.categorie), `${p.id}: onbekende categorie ${p.categorie}`);
    assert.ok(NIVEAUS.includes(p.niveau), `${p.id}: onbekend niveau ${p.niveau}`);
    assert.ok(p.prijs === null || (typeof p.prijs === 'number' && p.prijs >= 0), `${p.id}: prijs moet null of een getal zijn`);
    assert.ok(['placeholder', 'actief'].includes(p.affiliate_status), `${p.id}: onbekende affiliate_status`);
    assert.equal(typeof p.uitgelicht, 'boolean', `${p.id}: uitgelicht moet een boolean zijn`);
  }
});

test('producten: geen verzonnen prijzen of affiliate-links', () => {
  // Zolang een product een placeholder is, mag het geen prijs en geen echte affiliate-link hebben.
  for (const p of laad('producten.json')) {
    if (p.affiliate_status === 'placeholder') {
      assert.equal(p.prijs, null, `${p.id}: placeholder-product heeft een prijs`);
      assert.match(p.affiliate_url, /voorbeeldwinkel\.nl/, `${p.id}: placeholder-product heeft een echte affiliate-link`);
    }
  }
});

test('artikelen: geldige structuur', () => {
  const artikelen = laad('artikelen.json');
  assert.ok(artikelen.length > 0);
  assert.deepEqual(dubbeleIds(artikelen), []);

  for (const a of artikelen) {
    assert.ok(['artikel', 'koopgids'].includes(a.type), `${a.id}: onbekend type ${a.type}`);
    assert.ok(a.titel && a.titel.trim(), `${a.id}: titel ontbreekt`);
    assert.match(a.datum, ISO_DATUM, `${a.id}: datum moet JJJJ-MM-DD zijn`);
    assert.ok(Array.isArray(a.inhoud) && a.inhoud.length > 0, `${a.id}: inhoud moet een niet-lege lijst zijn`);
    for (const alinea of a.inhoud) {
      assert.ok(alinea.trim().length > 0, `${a.id}: lege alinea`);
    }
  }
});

test('kampeerplekken: coördinaten, prijzen en links kloppen', () => {
  const plekken = laad('kampeerplekken.json');
  assert.ok(plekken.length > 0);
  assert.deepEqual(dubbeleIds(plekken), []);

  for (const k of plekken) {
    assert.ok(k.naam && k.naam.trim(), `${k.id}: naam ontbreekt`);
    // lat en lng: allebei een getal, of allebei null
    assert.equal(typeof k.lat, typeof k.lng, `${k.id}: lat en lng moeten allebei een getal of allebei null zijn`);
    if (typeof k.lat === 'number') {
      // ruwe grens rond Nederland, zodat een omgedraaide of foute coördinaat opvalt
      assert.ok(k.lat >= 50.5 && k.lat <= 53.7, `${k.id}: lat ${k.lat} ligt buiten Nederland`);
      assert.ok(k.lng >= 3.2 && k.lng <= 7.3, `${k.id}: lng ${k.lng} ligt buiten Nederland`);
    }
    assert.ok(k.prijs_per_nacht === null || (typeof k.prijs_per_nacht === 'number' && k.prijs_per_nacht >= 0), `${k.id}: ongeldige prijs`);
    assert.ok(Array.isArray(k.voorzieningen), `${k.id}: voorzieningen moet een lijst zijn`);
    if (k.website) {
      assert.match(k.website, /^https:\/\//, `${k.id}: website moet met https beginnen`);
    }
  }
});

test('campings-osm: bronvermelding en structuur', () => {
  const osm = laad('campings-osm.json');
  assert.match(osm.bron, /OpenStreetMap/, 'bronvermelding OpenStreetMap ontbreekt');
  assert.match(osm.bron, /ODbL/, 'licentie ODbL ontbreekt in de bronvermelding');
  assert.ok(Array.isArray(osm.campings));

  const kuratie = new Set(laad('kampeerplekken.json').map((k) => k.id));
  for (const c of osm.campings) {
    assert.match(c.id, /^osm-(node|way|relation)-\d+$/, `${c.id}: id heeft geen OSM-vorm`);
    assert.equal(typeof c.lat, 'number', `${c.id}: lat ontbreekt`);
    assert.equal(typeof c.lng, 'number', `${c.id}: lng ontbreekt`);
    assert.ok(!kuratie.has(c.id), `${c.id}: id bestaat al in kampeerplekken.json`);
  }
});

test('tags: alleen bekende tags, zodat de kiezer ze kan vinden', () => {
  const BEKEND = ['kamperen', 'wandelen', 'outdoor', 'uitrusting', 'beginner', 'tent', 'slaapzak', 'slaapmat',
    'licht', 'rugzak', 'kleding', 'meubels', 'koken'];
  for (const bestand of ['artikelen.json', 'producten.json']) {
    for (const item of laad(bestand)) {
      assert.ok(Array.isArray(item.tags), `${item.id}: tags moet een lijst zijn`);
      for (const tag of item.tags) {
        assert.ok(BEKEND.includes(tag), `${item.id}: onbekende tag ${tag}`);
      }
    }
  }
});
