/*eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmluZWV0am9jIiwiYSI6ImNrcW1sMnllOTEyM3kyeHBoZ3MwcGRuNHkifQ.VtsLFHQWD_9oFPpqnWGRVg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vineetjoc/ckqmligu112rx17kje3qd2v3f',
    //   center: [-118.24285500596558, 34.032681016288215],
    //   zoom: 4,
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    bounds.extend(loc.coordinates);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}`)
      .addTo(map);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100,
    },
  });
};
