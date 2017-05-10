exports = module.exports = function transform(ast, mapper) {
  mapper = normalize(mapper);
  var reverse = mapper.reverse;
  function traverse(node, index, parent) {
    node = mapper.enter(node, index, parent) || node;

    if (node.children) {
      node.children = (
        reverse ?
          node.children.reverse() :
          node.children
      ).map(function(child, index) {
        if (reverse) index = node.children.length - 1 - index;
        return traverse(child, index, node);
      });
    }

    return mapper.exit(node, index, parent) || node;
  }
  return traverse(ast, null, null);
};

exports.normalize = normalize;
function normalize(mapper) {
  if (typeof mapper === 'function') mapper = {enter: mapper};
  wrap(mapper, 'enter');
  wrap(mapper, 'exit');
  return mapper;
};

function wrap(mapper, name) {
  var types = mapper.types;

  if (typeof types === 'string') types = [types];
  if (Array.isArray(types)) types = new Set(types);

  var fn = mapper[name] || function noop(node) { return node; };

  mapper[name] = function(node) {
    return !types || types.has(node.type) ?
      fn.apply(mapper, arguments) :
      node;
  };
};
