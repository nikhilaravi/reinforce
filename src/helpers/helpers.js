const UINT8_VIEW = new Uint8Array(4),
  FLOAT_VIEW = new Float32Array(UINT8_VIEW.buffer)

export default {
  /**
   * Returns a new string in which all leading and trailing occurrences of a set of specified characters from the current String object are removed.
   * @param  { String } string - source string
   * @returns { String } - cleaned string
   */
  trim: function(string) {
    return string.replace(/^\s+|\s+$/gm, '')
  },

  decodeFloat: function(x, y, z, w) {
    UINT8_VIEW[0] = Math.floor(w)
    UINT8_VIEW[1] = Math.floor(z)
    UINT8_VIEW[2] = Math.floor(y)
    UINT8_VIEW[3] = Math.floor(x)
    return FLOAT_VIEW[0]
  },

  sampleArray: function(arr) {
  	return arr[Math.round(Math.random() * (arr.length - 1))]
  },

  roundDown: function(num, nearestInt) {
    return Math.floor(num / nearestInt) * nearestInt
  },

  flatten: function(acc, curr) {
  	if(!acc) { return [curr] }
  	if(curr.length) {
  		curr.forEach(el => acc.push(el))
  	} else {
	  	acc.push(curr)
  	}
  	return acc
  },

  createDictByProp: function(arr, prop) {
  	return arr.reduce((acc, curr) => {
  		if(!acc[curr[prop]]) { acc[curr[prop]] = []}
  		acc[curr[prop]].push(curr)
  		return acc
  	}, {})
  },

  bindAll(ctx, fns) {
  	fns.forEach(d => {
  		ctx[d] = ctx[d].bind(ctx)
  	})
  },

  dictToArray(dict, num=false) {
    let key;
    return Object.keys(dict).sort().reduce((arr, elem) => {
      key = elem
      if (num) {
        // turn key into a numeric value rounded to 4 dp
        key = Number(Number(elem).toFixed(4))
      }
      arr.push([key, dict[elem]]);
      return arr;
    }, []);
  }
}
