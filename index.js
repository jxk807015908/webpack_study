const cfg = require('./config');
const path = require('path');
const fs = require('fs');
const entry = path.resolve(cfg.entry);

// 当前代码执行环境
const EXEC_PATH = path.resolve();

function Module() {
  var modules = '';
  var map = {};
  this.add = (_path, code) => {
    _path = getRelativePath(_path);
    if (this.has(_path)) return;
    map[_path] = 1;
    modules += `${modules ? ',' : ''}\n\n'${_path}':function(module, exports, require) { \n${code}\n}`
  }
  this.has = (path) => {
    return map[path];
  }
  this.get = () => {
    return `{${modules}\n}`
  }
}

const mod = new Module();

function parseFile(path) {
  if (mod.has(path)) return;
  try {
    let code;
    code = fs.readFileSync(path, 'utf8');
    code = translatePath(code, path);
    mod.add(path, code);
  } catch (e) {
    console.error(e);
  }
}

function translatePath(code, _path) {
  return code.replace(/require\s*\(\s*['"`]([^)]+)['"`]\s*\)/g, function () {
    let path_abs = path.resolve(_path, '../', arguments[1] + '.js');
    let path_rel = getRelativePath(path_abs);
    parseFile(path_rel);
    return `require('${path_rel}')`;
  })
}

function getRelativePath(_path) {
  return path.relative(EXEC_PATH, _path).replace(/\\/g, '/');
}

function addShell() {
  return `(function (modules) {
  const cacheModule = {};
  function require(id) {
    if (!cacheModule[id]) {
      let module = cacheModule[id] = {
        exports: {}
      };
      modules[id].call(module.exports, module, module.exports, require);
    }
    return cacheModule[id].exports;
  }
  return require('${getRelativePath(entry)}');
})(${mod.get()})`;
}

function outPut() {
  fs.writeFile(path.resolve(cfg.output.filename), addShell(), (err)=>{
    if (err) console.error(e);
    else {
      console.log('打包完成');
    }

  });
}

parseFile(entry);
outPut();