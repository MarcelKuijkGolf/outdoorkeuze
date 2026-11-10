/* ==========================================================
   OutdoorKeuze.nl - hoofdscript
   Bouwt header, footer, productlijsten, artikelen en de
   kampeerplekkenkaart op. Gegevens komen uit de map /data (JSON).
   ========================================================== */

(function () {
  'use strict';

  var CATEGORIEN = {
    kamperen: 'Kamperen',
    wandelen: 'Wandelen',
    outdoor: 'Outdoor',
    uitrusting: 'Uitrusting'
  };

  var NIVEAUS = {
    instap: 'Instap',
    gevorderd: 'Gevorderd',
    expert: 'Expert'
  };

  var ICONEN = {
    kamperen: '⛺',
    wandelen: '🥾',
    outdoor: '🧥',
    uitrusting: '🎒'
  };

  var TYPES = {
    artikel: 'Artikel',
    koopgids: 'Koopgids'
  };

  /* ---------- Hulpfuncties ---------- */

  // Voorkomt dat tekst uit de JSON als HTML wordt uitgevoerd
  function esc(tekst) {
    return String(tekst === null || tekst === undefined ? '' : tekst)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function lijstHTML(items) {
    return (items || []).map(function (item) {
      return '<li>' + esc(item) + '</li>';
    }).join('');
  }

  function datumNL(iso) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function laadJson(pad) {
    return fetch(pad).then(function (antwoord) {
      if (!antwoord.ok) {
        throw new Error('Kan ' + pad + ' niet laden');
      }
      return antwoord.json();
    });
  }

  // Supabase: schema outdoorkeuze. De publishable key is bedoeld voor de browser;
  // de rijen die bezoekers zien worden bepaald door de RLS-policies (alleen gepubliceerd).
  var SUPABASE_URL = 'https://xbbmunitjfbhkwesercs.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_n6sA6FYxP2Wpxh7tyANxXQ_D5drnXGv';

  function leesSupabase(tabel, queryString) {
    return fetch(SUPABASE_URL + '/rest/v1/' + tabel + '?select=*' + (queryString || ''), {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Accept-Profile': 'outdoorkeuze'
      }
    }).then(function (antwoord) {
      if (!antwoord.ok) {
        throw new Error('Supabase ' + tabel + ': ' + antwoord.status);
      }
      return antwoord.json();
    });
  }

  // Probeert eerst de database. Lukt dat niet, of is de tabel leeg, dan de JSON-bestanden.
  function laadData(tabel, queryString, pad, naarVorm) {
    return leesSupabase(tabel, queryString)
      .then(function (rijen) {
        if (!rijen || rijen.length === 0) {
          throw new Error('Geen rijen in ' + tabel);
        }
        return rijen.map(naarVorm);
      })
      .catch(function () {
        return laadJson(pad);
      });
  }

  function naarProduct(r) {
    var d = r.details || {};
    return Object.assign({}, r, {
      eigenschappen: d.eigenschappen || [],
      voordelen: d.voordelen || [],
      nadelen: d.nadelen || []
    });
  }

  function naarArtikel(a) {
    return Object.assign({}, a, {
      inhoud: (a.inhoud || '').split(/\n\n+/).filter(Boolean)
    });
  }

  /* ---------- Header en footer ---------- */

  function headerHTML() {
    return '' +
      '<header class="site-header">' +
        '<div class="kop-inhoud">' +
          '<a href="index.html" class="logo">Outdoor<span>Keuze</span>.nl</a>' +
          '<button class="menu-knop" type="button" aria-expanded="false" aria-controls="hoofdmenu">Menu</button>' +
          '<nav id="hoofdmenu" class="hoofdmenu" aria-label="Hoofdmenu">' +
            '<a href="index.html">Home</a>' +
            '<a href="vergelijkingen.html?categorie=kamperen">Kamperen</a>' +
            '<a href="kampeerplekken.html">Kampeerplekken</a>' +
            '<a href="vergelijkingen.html?categorie=wandelen">Wandelen</a>' +
            '<a href="vergelijkingen.html?categorie=outdoor">Outdoor</a>' +
            '<a href="vergelijkingen.html?categorie=uitrusting">Uitrusting</a>' +
            '<a href="vergelijkingen.html">Vergelijkingen</a>' +
            '<a href="artikelen.html?type=koopgids">Koopgidsen</a>' +
            '<a href="artikelen.html">Artikelen</a>' +
            '<a href="over-ons.html">Over ons</a>' +
            '<a href="contact.html">Contact</a>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }

  function footerHTML() {
    return '' +
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div>' +
              '<h4>OutdoorKeuze.nl</h4>' +
              '<p>Alles voor jouw volgende avontuur.</p>' +
            '</div>' +
            '<div>' +
              '<h4>Categorieën</h4>' +
              '<ul>' +
                '<li><a href="vergelijkingen.html?categorie=kamperen">Kamperen</a></li>' +
                '<li><a href="kampeerplekken.html">Kampeerplekken</a></li>' +
                '<li><a href="vergelijkingen.html?categorie=wandelen">Wandelen</a></li>' +
                '<li><a href="vergelijkingen.html?categorie=outdoor">Outdoor</a></li>' +
                '<li><a href="vergelijkingen.html?categorie=uitrusting">Uitrusting</a></li>' +
              '</ul>' +
            '</div>' +
            '<div>' +
              '<h4>Informatie</h4>' +
              '<ul>' +
                '<li><a href="artikelen.html">Artikelen</a></li>' +
                '<li><a href="artikelen.html?type=koopgids">Koopgidsen</a></li>' +
                '<li><a href="over-ons.html">Over ons</a></li>' +
                '<li><a href="contact.html">Contact</a></li>' +
              '</ul>' +
            '</div>' +
            '<div>' +
              '<h4>Juridisch</h4>' +
              '<ul>' +
                '<li><a href="privacy.html">Privacyverklaring</a></li>' +
                '<li><a href="affiliate.html">Affiliateverklaring</a></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<p class="footer-onder">' +
            'Sommige links op deze site zijn affiliatelinks. Lees meer in onze ' +
            '<a href="affiliate.html">affiliateverklaring</a>. ' +
            '© ' + new Date().getFullYear() + ' OutdoorKeuze.nl' +
          '</p>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- Kaarten ---------- */

  function productKaartHTML(p) {
    var prijs = (typeof p.prijs === 'number')
      ? '€ ' + p.prijs.toFixed(2).replace('.', ',')
      : 'Prijs volgt';

    var placeholder = p.affiliate_status === 'placeholder'
      ? '<span class="placeholder-notitie">Placeholder-link</span>'
      : '';

    var niveau = NIVEAUS[p.niveau]
      ? '<span class="niveau-badge niveau-' + esc(p.niveau) + '">' + esc(NIVEAUS[p.niveau]) + '</span>'
      : '';

    return '' +
      '<article class="product-kaart">' +
        '<span class="demo-label">Demo</span>' +
        '<div class="product-beeld" aria-hidden="true">' + (ICONEN[p.categorie] || '📦') + '</div>' +
        '<div class="product-inhoud">' +
          niveau +
          '<p class="merk">' + esc(p.merk) + '</p>' +
          '<h3>' + esc(p.naam) + '</h3>' +
          '<p class="prijs">' + esc(prijs) + '</p>' +
          '<ul class="eigenschappen">' + lijstHTML(p.eigenschappen) + '</ul>' +
          '<div class="voor-nadelen">' +
            '<div><h4>Voordelen</h4><ul>' + lijstHTML(p.voordelen) + '</ul></div>' +
            '<div><h4>Nadelen</h4><ul>' + lijstHTML(p.nadelen) + '</ul></div>' +
          '</div>' +
        '</div>' +
        '<div class="product-actie">' +
          placeholder +
          '<a class="knop" href="' + esc(p.affiliate_url) + '" target="_blank" rel="sponsored nofollow noopener">Bekijk bij de winkel</a>' +
        '</div>' +
      '</article>';
  }

  function plekKaartHTML(p) {
    return '' +
      '<article class="plek-kaart" data-plek="' + esc(p.id) + '" tabindex="0">' +
        '<h3>' + esc(p.naam) + '</h3>' +
        '<p class="merk">' + esc([p.plaats, p.provincie].filter(Boolean).join(' · ')) + '</p>' +
        '<p class="prijs">' + esc(prijsPerNachtTekst(p)) + '</p>' +
        '<ul class="eigenschappen">' + lijstHTML(p.voorzieningen) + '</ul>' +
        '<a class="knop knop-klein" href="' + esc(p.website) + '" target="_blank" rel="sponsored nofollow noopener">Bekijk de camping</a>' +
      '</article>';
  }

  function prijsPerNachtTekst(p) {
    return (typeof p.prijs_per_nacht === 'number')
      ? '€ ' + p.prijs_per_nacht.toFixed(2).replace('.', ',') + ' per nacht'
      : 'Prijs per nacht volgt';
  }

  function artikelKaartHTML(a, openen) {
    return '' +
      '<article class="artikel-kaart" id="' + esc(a.id) + '">' +
        '<span class="badge">' + esc(TYPES[a.type] || 'Artikel') + '</span>' +
        '<h3>' + esc(a.titel) + '</h3>' +
        '<p class="datum">' + esc(datumNL(a.datum)) + '</p>' +
        '<p>' + esc(a.samenvatting) + '</p>' +
        '<details' + (openen ? ' open' : '') + '>' +
          '<summary>Lees het artikel</summary>' +
          (a.inhoud || []).map(function (alinea) {
            return '<p>' + esc(alinea) + '</p>';
          }).join('') +
        '</details>' +
      '</article>';
  }

  function miniKaartHTML(a) {
    return '' +
      '<a class="artikel-mini" href="artikelen.html#' + esc(a.id) + '">' +
        '<span class="badge">' + esc(TYPES[a.type] || 'Artikel') + '</span>' +
        '<h3>' + esc(a.titel) + '</h3>' +
        '<p>' + esc(a.samenvatting) + '</p>' +
      '</a>';
  }

  /* ---------- Filteren ---------- */

  function filterProducten(producten, categorie, niveau, zoekterm) {
    var zoek = (zoekterm || '').trim().toLowerCase();
    return producten.filter(function (p) {
      var pastBij = !categorie || p.categorie === categorie;
      var pastBijNiveau = !niveau || p.niveau === niveau;
      var tekst = [p.naam, p.merk, p.subcategorie].join(' ').toLowerCase();
      return pastBij && pastBijNiveau && (!zoek || tekst.indexOf(zoek) !== -1);
    });
  }

  /* ---------- Pagina's ---------- */

  function initHome(producten, artikelen) {
    var uitgelicht = producten.filter(function (p) { return p.uitgelicht; }).slice(0, 3);
    var koopgidsen = artikelen.filter(function (a) { return a.type === 'koopgids'; }).slice(0, 2);
    var recent = artikelen.slice().sort(function (a, b) {
      return b.datum.localeCompare(a.datum);
    }).slice(0, 3);

    document.getElementById('uitgelicht').innerHTML =
      uitgelicht.map(productKaartHTML).join('');
    document.getElementById('koopgidsen').innerHTML =
      koopgidsen.map(miniKaartHTML).join('');
    document.getElementById('recente-artikelen').innerHTML =
      recent.map(miniKaartHTML).join('');
  }

  function initVergelijkingen(producten) {
    var params = new URLSearchParams(window.location.search);
    var ruwCat = params.get('categorie') || '';
    var ruwNiv = params.get('niveau') || '';

    var categorie = CATEGORIEN.hasOwnProperty(ruwCat) ? ruwCat : '';
    var niveau = NIVEAUS.hasOwnProperty(ruwNiv) ? ruwNiv : '';

    var titel = document.getElementById('paginatitel');
    var zoekInvoer = document.getElementById('filter-zoek');
    var lijst = document.getElementById('productlijst');
    var teller = document.getElementById('resultaat-teller');
    var categorieKnoppen = document.querySelectorAll('[data-categorie]');
    var niveauKnoppen = document.querySelectorAll('[data-niveau]');

    zoekInvoer.value = params.get('q') || '';

    function zetTitel() {
      titel.textContent = CATEGORIEN.hasOwnProperty(categorie)
        ? CATEGORIEN[categorie]
        : 'Productvergelijkingen';
    }

    function teken() {
      var resultaat = filterProducten(producten, categorie, niveau, zoekInvoer.value);
      lijst.innerHTML = resultaat.length
        ? resultaat.map(productKaartHTML).join('')
        : '<p>Geen producten gevonden. Probeer een andere combinatie of zoekterm.</p>';
      teller.textContent = resultaat.length + ' product(en) getoond';
    }

    function activeerGroep(knoppen, attr, waarde, actief) {
      knoppen.forEach(function (knop) {
        knop.classList.toggle('actief', knop.getAttribute(attr) === waarde);
      });
    }

    categorieKnoppen.forEach(function (knop) {
      knop.addEventListener('click', function () {
        categorie = knop.getAttribute('data-categorie');
        activeerGroep(categorieKnoppen, 'data-categorie', categorie);
        zetTitel();
        teken();
      });
    });

    niveauKnoppen.forEach(function (knop) {
      knop.addEventListener('click', function () {
        niveau = knop.getAttribute('data-niveau');
        activeerGroep(niveauKnoppen, 'data-niveau', niveau);
        teken();
      });
    });

    activeerGroep(categorieKnoppen, 'data-categorie', categorie);
    activeerGroep(niveauKnoppen, 'data-niveau', niveau);

    zoekInvoer.addEventListener('input', teken);

    zetTitel();
    teken();
  }

  function initArtikelen(artikelen) {
    var params = new URLSearchParams(window.location.search);
    var ruw = params.get('type') || '';
    var type = (ruw === 'artikel' || ruw === 'koopgids') ? ruw : '';
    var openId = window.location.hash.slice(1);

    var titels = {
      '': 'Artikelen en koopgidsen',
      artikel: 'Artikelen',
      koopgids: 'Koopgidsen'
    };

    var titel = document.getElementById('paginatitel');
    var lijst = document.getElementById('artikel-lijst');
    var knoppen = document.querySelectorAll('.filter-knop');

    function teken() {
      var gefilterd = type
        ? artikelen.filter(function (a) { return a.type === type; })
        : artikelen.slice();

      gefilterd.sort(function (a, b) { return b.datum.localeCompare(a.datum); });

      lijst.innerHTML = gefilterd.length
        ? gefilterd.map(function (a) {
            return artikelKaartHTML(a, a.id === openId);
          }).join('')
        : '<p>Er zijn nog geen artikelen in deze categorie.</p>';

      titel.textContent = titels[type];

      if (openId) {
        var gevonden = document.getElementById(openId);
        if (gevonden) {
          gevonden.scrollIntoView();
        }
      }
    }

    knoppen.forEach(function (knop) {
      knop.classList.toggle('actief', knop.getAttribute('data-type') === type);
      knop.addEventListener('click', function () {
        type = knop.getAttribute('data-type');
        knoppen.forEach(function (k) {
          k.classList.toggle('actief', k === knop);
        });
        teken();
      });
    });

    teken();
  }

  var PITCHUP_NL = 'https://www.pitchup.com/en-us/campsites/netherlands/-/english/';

  function initKampeerplekken(kuratiePlekken, osmPlekken) {
    var plekken = kuratiePlekken.concat(osmPlekken || []);
    if (!window.L) {
      throw new Error('Kaartbibliotheek niet geladen');
    }

    var zoek = document.getElementById('plek-zoek');
    var prijsSchuif = document.getElementById('prijs-max');
    var prijsLabel = document.getElementById('prijs-max-label');
    var toonOnbekend = document.getElementById('toon-onbekend');
    var lijst = document.getElementById('plek-lijst');
    var teller = document.getElementById('plek-teller');

    // Nederland als startpunt
    var kaart = L.map('kaart').setView([52.2, 5.3], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap-bijdragers'
    }).addTo(kaart);

    // Clusters houden de kaart licht als er veel campings bij komen
    var markerLaag = L.markerClusterGroup({ maxClusterRadius: 45, showCoverageOnHover: false }).addTo(kaart);
    var markers = {};

    // Lichte popup: alleen wat nodig is. Prijzen komen later uit een afgesproken bron.
    function popupHTML(p) {
      var regels = ['<strong>' + esc(p.naam) + '</strong>'];
      var plaats = [p.plaats, p.provincie].filter(Boolean).join(' · ');
      if (plaats) {
        regels.push('<span>' + esc(plaats) + '</span>');
      }
      if (p.website && /^https:\/\//.test(p.website)) {
        regels.push('<a href="' + esc(p.website) + '" target="_blank" rel="noopener">Website van de camping</a>');
      }
      regels.push('<a href="' + PITCHUP_NL + '" target="_blank" rel="noopener">Prijzen op Pitchup (Nederland)</a>');
      return regels.join('<br>');
    }

    function passeert(p) {
      var zoekterm = zoek.value.trim().toLowerCase();
      var tekst = [p.naam, p.plaats, p.provincie].join(' ').toLowerCase();
      if (zoekterm && tekst.indexOf(zoekterm) === -1) {
        return false;
      }
      var max = Number(prijsSchuif.value);
      if (typeof p.prijs_per_nacht === 'number') {
        return max >= 100 || p.prijs_per_nacht <= max;
      }
      return toonOnbekend.checked;
    }

    function teken() {
      var max = Number(prijsSchuif.value);
      prijsLabel.textContent = max >= 100 ? 'alle prijzen' : '€ ' + max;

      var resultaat = plekken.filter(passeert);

      markerLaag.clearLayers();
      markers = {};
      resultaat.forEach(function (p) {
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') {
          return;
        }
        var marker = L.circleMarker([p.lat, p.lng], {
          radius: 7,
          weight: 2,
          color: '#1e3b2a',
          fillColor: '#4f9a62',
          fillOpacity: 0.9
        }).bindPopup(popupHTML(p));
        marker.addTo(markerLaag);
        markers[p.id] = marker;
      });

      var zichtbaar = resultaat.slice(0, 60);

      lijst.innerHTML = zichtbaar.length
        ? zichtbaar.map(plekKaartHTML).join('')
        : '<p>Geen plekken gevonden met deze filters.</p>';

      teller.textContent = resultaat.length + ' van ' + plekken.length + ' plekken getoond' +
        (resultaat.length > 60 ? '. Er staan er 60 in de lijst; verfijn je zoekopdracht om meer te zien.' : '.');

      lijst.querySelectorAll('[data-plek]').forEach(function (kaartEl) {
        function toonOpKaart() {
          var id = kaartEl.getAttribute('data-plek');
          var p = plekken.filter(function (x) { return x.id === id; })[0];
          if (p && markers[id]) {
            // zoomToShowLayer zoomt uit de cluster en opent daarna de popup
            markerLaag.zoomToShowLayer(markers[id], function () {
              markers[id].openPopup();
            });
          }
        }
        kaartEl.addEventListener('click', toonOpKaart);
        kaartEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            toonOpKaart();
          }
        });
      });
    }

    zoek.addEventListener('input', teken);
    prijsSchuif.addEventListener('input', teken);
    toonOnbekend.addEventListener('change', teken);

    teken();
  }

  /* ---------- Menu voor mobiel ---------- */

  document.addEventListener('click', function (e) {
    var knop = e.target.closest ? e.target.closest('.menu-knop') : null;
    if (!knop) {
      return;
    }
    var menu = document.getElementById('hoofdmenu');
    var open = menu.classList.toggle('open');
    knop.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Opstarten ---------- */

  function toonFout() {
    var main = document.querySelector('main');
    if (main) {
      main.insertAdjacentHTML('afterbegin',
        '<div class="fout-melding">' +
        'De gegevens konden niet worden geladen. Open de site via GitHub Pages of via een lokale server ' +
        '(zie README.md). Openen door direct op index.html te dubbelklikken werkt meestal niet.' +
        '</div>');
    }
  }

  function init() {
    var header = document.getElementById('site-header');
    if (header) {
      header.innerHTML = headerHTML();
    }

    var footer = document.getElementById('site-footer');
    if (footer) {
      footer.innerHTML = footerHTML();
    }

    var pagina = document.body.getAttribute('data-pagina');
    var laden = null;

    var producten = function () {
      return laadData('producten', '&gepubliceerd=eq.true&order=naam', 'data/producten.json', naarProduct);
    };
    var artikelen = function () {
      return laadData('artikelen', '&order=datum.desc', 'data/artikelen.json', naarArtikel);
    };

    if (pagina === 'home') {
      laden = Promise.all([producten(), artikelen()]).then(function (resultaat) {
        initHome(resultaat[0], resultaat[1]);
      });
    } else if (pagina === 'vergelijkingen') {
      laden = producten().then(initVergelijkingen);
    } else if (pagina === 'artikelen') {
      laden = artikelen().then(initArtikelen);
    } else if (pagina === 'kampeerplekken') {
      laden = Promise.all([
        laadData('kampeerplekken', '&order=naam', 'data/kampeerplekken.json', function (k) {
          return Object.assign({}, k, { voorzieningen: k.voorzieningen || [] });
        }),
        laadJson('data/campings-osm.json').then(function (osm) {
          return osm.campings || [];
        }).catch(function () { return []; })
      ]).then(function (resultaat) {
        initKampeerplekken(resultaat[0], resultaat[1]);
      });
    }

    if (laden) {
      laden.catch(toonFout);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
