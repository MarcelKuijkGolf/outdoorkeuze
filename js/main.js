/* ==========================================================
   OutdoorKeuze.nl - hoofdscript
   Bouwt header, footer, productlijsten en artikelen op.
   Gegevens komen uit de map /data (JSON).
   ========================================================== */

(function () {
  'use strict';

  var CATEGORIEN = {
    kamperen: 'Kamperen',
    wandelen: 'Wandelen',
    outdoor: 'Outdoor',
    uitrusting: 'Uitrusting'
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

    return '' +
      '<article class="product-kaart">' +
        '<span class="demo-label">Demo</span>' +
        '<div class="product-beeld" aria-hidden="true">' + (ICONEN[p.categorie] || '📦') + '</div>' +
        '<div class="product-inhoud">' +
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

  function filterProducten(producten, categorie, zoekterm) {
    var zoek = (zoekterm || '').trim().toLowerCase();
    return producten.filter(function (p) {
      var pastBij = !categorie || p.categorie === categorie;
      var tekst = [p.naam, p.merk, p.subcategorie].join(' ').toLowerCase();
      return pastBij && (!zoek || tekst.indexOf(zoek) !== -1);
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
    var ruw = params.get('categorie') || '';
    var categorie = CATEGORIEN.hasOwnProperty(ruw) ? ruw : '';

    var titel = document.getElementById('paginatitel');
    var zoekInvoer = document.getElementById('filter-zoek');
    var lijst = document.getElementById('productlijst');
    var teller = document.getElementById('resultaat-teller');
    var knoppen = document.querySelectorAll('.filter-knop');

    zoekInvoer.value = params.get('q') || '';

    function zetTitel() {
      titel.textContent = CATEGORIEN.hasOwnProperty(categorie)
        ? CATEGORIEN[categorie]
        : 'Productvergelijkingen';
    }

    function teken() {
      var resultaat = filterProducten(producten, categorie, zoekInvoer.value);
      lijst.innerHTML = resultaat.length
        ? resultaat.map(productKaartHTML).join('')
        : '<p>Geen producten gevonden. Probeer een andere zoekterm.</p>';
      teller.textContent = resultaat.length + ' product(en) getoond';
    }

    knoppen.forEach(function (knop) {
      knop.classList.toggle('actief', knop.getAttribute('data-categorie') === categorie);
      knop.addEventListener('click', function () {
        categorie = knop.getAttribute('data-categorie');
        knoppen.forEach(function (k) {
          k.classList.toggle('actief', k === knop);
        });
        zetTitel();
        teken();
      });
    });

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

    if (pagina === 'home') {
      laden = Promise.all([
        laadJson('data/producten.json'),
        laadJson('data/artikelen.json')
      ]).then(function (resultaat) {
        initHome(resultaat[0], resultaat[1]);
      });
    } else if (pagina === 'vergelijkingen') {
      laden = laadJson('data/producten.json').then(initVergelijkingen);
    } else if (pagina === 'artikelen') {
      laden = laadJson('data/artikelen.json').then(initArtikelen);
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
