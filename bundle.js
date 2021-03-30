(function (modules) {
  const cacheModule = {};
  function require(id) {
    if (!cacheModule[id]) {
      let module = cacheModule[id] = {
        exports: undefined
      };
      modules[id].call(module.exports, module, module.exports, require);
    }
    return cacheModule[id].exports;
  }
  return require('examples/index.js');
})({

'examples/config.js':function(module, exports, require) { 
module.exports = {
  base: '/'
}
},

'examples/aa.js':function(module, exports, require) { 
const cfg = require('examples/config.js');
cfg.base = '333';
module.exports = {

};
},

'examples/index.js':function(module, exports, require) { 
const obj = require('examples/aa.js');
const config = require('examples/config.js');
console.log(config)
}
})