var utils = require('./_utils'),
  nodeResolve = require('rollup-plugin-node-resolve'),
  commonjs = require('rollup-plugin-commonjs'),
  rollup = require( 'rollup' ),
  mkdirp = require('mkdirp'),
  fs = require('fs'),
  babel = require('rollup-plugin-babel')

module.exports = function(options) {
  /**
   * Create a promise based on the result of the webpack compiling script
   */

  return new Promise(function(resolve, reject) {
    rollup.rollup({
      entry: './src/index.js',
      plugins: [
        babel({
          exclude: './node_modules/**',
          presets: 'es2015-rollup'
        }),
        nodeResolve({
          jsnext: true,
          main: true
        })
        // commonjs({ 
        //   include: './node_modules/**' 
        // })
      ]
    }).then( function ( bundle ) {
      var result = bundle.generate({ format: 'cjs' }).code

      mkdirp('./dist', function() {
        try {
          fs.writeFileSync(`./dist/${ global.library }.js`, result, 'utf8')
          resolve()
        } catch (e) {
          reject(e)
        }
      })

    }).catch(e =>{ utils.print(e, 'error') })
  })

}
