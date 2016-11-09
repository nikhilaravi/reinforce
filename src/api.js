export const getData = url =>
  fetch(`src/data/${url}.json`).then(data=>data.json())