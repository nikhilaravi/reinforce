export const getData = url =>
  fetch(`src/data/toy/${url}.json`).then(data=>data.json())