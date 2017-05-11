exports = module.exports = function transform(ast, mapper) {
  mapper = normalize(mapper);
  var reverse = mapper.reverse;
  function traverse(node, index, parent) {
    node = mapper.enter(node, index, parent);

    if (node.children) {
      node.children = (
        reverse ?
          node.children.reverse() :
          node.children
      ).map(function(child, index) {
        if (reverse) index = node.children.length - 1 - index;
        return traverse(child, index, node);
      }).filter(function(child) {
        return child !== null;
      });
    }

    return mapper.exit(node, index, parent);
  }
  return traverse(ast, null, null);
};

exports.normalize = normalize;
function normalize(mapper) {
  if (mapper.normalized) return mapper;
  if (typeof mapper === 'function') mapper = {enter: mapper};
  wrap(mapper, 'enter');
  wrap(mapper, 'exit');
  mapper.normalized = true;
  return mapper;
};

function wrap(mapper, name) {
  var types = mapper.types;

  if (typeof types === 'string') types = [types];
  if (Array.isArray(types)) types = new Set(types);

  var fn = mapper[name] || function noop(node) { return node; };

  mapper[name] = function(node) {
    return !types || types.has(node.type) ?
      mapReturn(fn.apply(mapper, arguments), node) :
      node;
  };
};

function mapReturn(returnValue, node) {
  return typeof returnValue === 'undefined' ? node : returnValue;
}
