export const getData = url =>
  fetch(`src/data/${url}.json`).then(data=>data.json())


  // export const getData = url => {
  //   const myInit = {
  //     method: 'get',
  //     mode: 'no-cors',
  //     headers: new Headers(
  //       {'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       })
  //     }
  //   return fetch(`https://raw.github.com/nikhilaravi/reinforce/master/src/data/${url}.json`, myInit).then(data=>data.json())
  //
  // }
