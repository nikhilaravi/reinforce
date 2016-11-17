export const getData = url =>
  fetch(`src/data/polarised_network/${url}.json`).then(data=>data.json())
