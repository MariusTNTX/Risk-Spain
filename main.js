let errorDiv = document.getElementById('error');
try {
  let linkingStart = null;

  /* RENDER MAP */
  const map = L.map('map').setView([40.1, -2.2], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  /* RENDER LINKS */
  LINK_LIST.forEach(k => {
    const coords = k.locations.map(x => x.split('_').map(y => parseFloat(y)));
    k.line = L.polyline(coords, { color: 'red', weight: 2 }).addTo(map);
  });

  /* RENDER LOCATIONS */
  LOCATION_LIST.forEach(t => {
    const popupContent = `
      <div class="popup-content">
        <b>Municipio</b>: ${t.name}<br/>
        <b>Provincia</b>: ${t.province}<br/>
        <b>Com. Aut.</b>: ${t.community}<br/>
        <b>Población</b>: ${t.population.toLocaleString('es-ES')} hab.<br/>
        <b>Altitud</b>: ${t.height.toFixed(0)} m<br/>
        <b>Coordenadas</b>: ${t.latitude.toFixed(5)}, ${t.longitude.toFixed(5)}
      </div>
    `;
    t.circle = L.circle([t.latitude, t.longitude], {
      radius: Math.sqrt(t.population) * 6,
      color: "blue",
      weight: 2,
      fillOpacity: 0.2
    }).addTo(map).bindPopup(popupContent);

    t.circle.on("contextmenu", () => {
      if (!linkingStart) {
        linkingStart = t;
        t.circle.setStyle({ color: "magenta", fillColor: "magenta" });
      } else {
        /* if (linkingStart !== t) {
          createOrDeleteLink(linkingStart, t);
        } else {
          linkingStart = null;
        }
        t.circle.setStyle({ color: "blue", fillColor: "blue" }); */
        if (linkingStart !== t) {
          createOrDeleteLink(linkingStart, t);
        } 
        linkingStart.circle.setStyle({ color: "blue", fillColor: "blue" });
        t.circle.setStyle({ color: "blue", fillColor: "blue" });
        linkingStart = null;
      }
    });
  });

  function createOrDeleteLink(locA, locB) {
    let linkToDelete = LINK_LIST.find(link => link.locations.includes(locA.id) && link.locations.includes(locB.id));
    if(linkToDelete) {
      map.removeLayer(linkToDelete.line);
      let index = LINK_LIST.indexOf(linkToDelete);
      if (index !== -1) {
        LINK_LIST.splice(index, 1);
      }
      return;
    }
    const coords = [[locA.latitude, locA.longitude], [locB.latitude, locB.longitude]];
    const line = L.polyline(coords, { color: 'red', weight: 2 }).addTo(map);
    LINK_LIST.push({ locations: [locA.id, locB.id], line, distance: map.distance(...coords) });
  }

  map.on('click', (e) => {
    console.log('map event', e);
  });

  document.getElementById('print')?.addEventListener('click', () => {
    console.log(LOCATION_LIST.map(l => {
      let result = { ...l };
      delete result.circle;
      return result;
    }));
    console.log(LINK_LIST.map(l => {
      let result = { ...l };
      delete result.line;
      return result;
    }));
  });
} catch (error) {
  errorDiv.innerHTML = error.stack;
}