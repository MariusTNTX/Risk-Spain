function getDistance(loc1, loc2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function setNearestLocations(originLocation, length) {
  let relativeLocations = LOCATION_LIST.map(location => ({
    location, 
    distance: location !== originLocation ? getDistance(originLocation, location) : 0
  }));

  originLocation.nearestRelativeLocations = relativeLocations.sort((a, b) => a.distance - b.distance).slice(1, length + 1);
}

/* LOCATION_LIST.map(l => setNearestLocations(l, 5));
console.log(LOCATION_LIST); */
