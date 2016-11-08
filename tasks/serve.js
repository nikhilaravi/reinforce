var utils = require('./_utils'),
	build = require('./build')

module.exports = function(options) {
  options = utils.extend({
    port: 8000
  }, options)
  // serve the contents of this folder
  return build().then(() => {
	  utils.exec('./node_modules/.bin/serve', utils.optionsToArray(options))
  })
}
