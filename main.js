let errorDiv = document.getElementById('error');

try {
  /* RENDER MAP */
  STORAGE.map = L.map('map').setView([40.1, -2.2], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(STORAGE.map);
  /* L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap'
  }).addTo(STORAGE.map); */

  /* RENDER LINKS */
  LINK_LIST.forEach(link => renderLinkLine(link));

  /* RENDER LOCATIONS */
  LOCATION_LIST.forEach(location => renderLocationCircle(location, STORAGE));

  STORAGE.map.on('click', (e) => {
    console.log('map event', e);
  });

  document.getElementById('print')?.addEventListener('click', () => {
    console.log(LINK_LIST.map(l => {
      let result = { ...l };
      delete result.line;
      return result;
    }));
  });
} catch (error) {
  errorDiv.innerHTML = error.stack;
}