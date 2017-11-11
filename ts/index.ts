export interface Node {
  type: string;
  children?: Node[];
}

export type MapperFunction =
  (node: Node, index: number, parent: Node) =>
    Node | null | void;

export interface MapperObject {
  reverse?: boolean;
  enter?: MapperFunction;
  exit?: MapperFunction;
  normalized?: boolean;
  types?: string | string[];
}

export interface NormalizedMapper {
  reverse: boolean;
  enter: MapperFunction;
  exit: MapperFunction;
  normalized: boolean;
}

export type Mapper = MapperFunction | MapperObject;

export default transform;

export function transform(ast: Node, mapper: Mapper) {
  const { enter, exit, reverse } = normalize(mapper);

  function traverse(node: Node, index: number, parent: Node) {
    const out = enter(node, index, parent);

    if (out === null || out === void 0) return out;

    const { children } = out;

    if (children !== undefined) {
      out.children = (
        reverse ?
          children.reverse() :
          children
      ).map((child, index) => {
        const mappedIndex = reverse ?
          children.length - 1 - index :
          index;
        return traverse(child, mappedIndex, node);
      }).filter(child => child !== null) as Node[];
    }

    return exit(node, index, parent);
  }

  return traverse(ast, 0, ast);
}

export function normalize(mapper: Mapper): NormalizedMapper {
  if (typeof mapper === 'object' && mapper.normalized === true) return mapper as NormalizedMapper;
  let mapperObj: MapperObject = {};

  if (typeof mapper === 'function') mapperObj.enter = mapper;
  else mapperObj = mapper;

  wrap(mapperObj, 'enter');
  wrap(mapperObj, 'exit');
  mapperObj.normalized = true;
  mapperObj.reverse = typeof mapper === 'function' ?
    false :
    mapper.reverse === true;

  return mapperObj as NormalizedMapper;
}

function wrap(mapper: MapperObject, name: 'enter' | 'exit') {
  let { types } = mapper;
  let typeSet: Set<string>;

  if (typeof types === 'string') types = [types];
  if (Array.isArray(types)) typeSet = new Set(types);

  const fn = mapper[name] || function noop(node: Node) { return node; }; // tslint:disable-line

  mapper[name] = function (node: Node) {
    return typeSet === undefined || typeSet.has(node.type) ?
      mapReturn(fn.apply(mapper, arguments), node) :
      node;
  };
}

function mapReturn(returnValue: Node | null | void, node: Node) {
  return returnValue === void 0 ? node : returnValue;
}
