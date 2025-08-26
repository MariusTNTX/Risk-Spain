let errorDiv = document.getElementById('error');

try {
  /* RENDER MAP */
  STORAGE.map = L.map('map').setView([40.1, -2.2], 6);
  L.tileLayer(ENV.tileLayer.link, { attribution: ENV.tileLayer.attribution }).addTo(STORAGE.map);

  /* RENDER LINKS */
  BBDD.links.forEach(link => renderLinkLine(link));

  /* RENDER LOCATIONS */
  BBDD.locations.forEach(location => renderLocationCircle(location, STORAGE));

  STORAGE.map.on('click', (e) => {
    console.log('map event', e);
  });

  document.getElementById('print')?.addEventListener('click', () => {
    console.log('BBDD.communities', BBDD.communities);
    console.log('BBDD.provinces', BBDD.provinces);
    console.log('BBDD.states', BBDD.states);
    console.log('LINK_LIST', BBDD.links.map(link => {
      let result = { ...link };
      result.locations = result.locations.map(l => l.id);
      delete result.line;
      return result;
    }));
  });
} catch (error) {
  errorDiv.innerHTML = error.stack;
}