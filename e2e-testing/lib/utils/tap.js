module.exports = function(fn1, fn2) {
  return function(...args) {
    fn1();

    return fn2(...args);
  }
}