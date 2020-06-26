// mapboxgl.accessToken =
//   "pk.eyJ1IjoiYWRlb21vYm95YSIsImEiOiJja2FtYWo3ZHoweXNrMnJvNmh0amZjOXVqIn0.kvDO1ifTpnZgtmnh9Js3GA";
// const map = new mapboxgl.Map({
//   container: "map",
//   style: "mapbox://styles/mapbox/streets-v11",
//   zoom: 15,
//   center: [3.5164085,6.4415226],
// });

// function loadMap() {
//   map.on("load", function () {
//     map.addSource("point", {
//       type: "geojson",
//       data: {
//         type: "FeatureCollection",
//         features: [
//           {
//             type: "Feature",
//             geometry: {
//               type: "Point",
//               coordinates: [3.5164085,6.4415226],
//             },
//             properties: {
//               storeId: 'IcePlanet',
//               icon: 'shop'
//             }
//           },
//         ],
//       },
//     });
//     map.addLayer({
//       id: "points",
//       type: "symbol",
//       source: "point",
//       layout: {
//         "icon-image": '{icon}-15',
//         "icon-size": 1.5,
//         "text-field": "{storeId}",
//         "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
//         "text-offset": [0, 0.9],
//         "text-anchor": "top"
//       },
//     });
//   });
// }

//loadMap();

function initMap() {
  const icePlanet = {lat: 6.4415226, lng: 3.5164085};

  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: icePlanet
  });

  const image = window.origin + '/images/logo-red-google.png';

  const marker = new google.maps.Marker({
    position: icePlanet,
    map: map,
    icon: image
  });
}

initMap();
