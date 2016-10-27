export default {
  /**
   * Returns a new string in which all leading and trailing occurrences of a set of specified characters from the current String object are removed.
   * @param  { String } string - source string
   * @returns { String } - cleaned string
   */
  trim: function(string) {
    return string.replace(/^\s+|\s+$/gm, '')
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
  
  bindAll(ctx, fns) {
  	fns.forEach(d => {
  		ctx[d] = ctx[d].bind(ctx)
  	})
  }
}
