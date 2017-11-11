import { test } from 'ava';
import { transform, normalize } from './';

const ast = {
  type: 'foo',
  other: 1,
  children: [
    {
      type: 'bar',
    },
    {
      type: 'foo',
    },
  ],
};

test('function traversal', (t) => {
  t.plan(3);

  transform(ast, ({ type }) => {
    t.true(type === 'foo' || type === 'bar');
  });
});

test('object traversal', (t) => {
  t.plan(4);

  transform(ast, {
    types: 'foo',

    enter({ type }) {
      t.true(type === 'foo');
    },

    exit({ type }) {
      t.true(type === 'foo');
    },
  });
});

test('object traversal types', (t) => {
  t.plan(6);

  transform(ast, {
    types: ['foo', 'bar'],

    enter({ type }) {
      t.true(type === 'foo' || type === 'bar');
    },

    exit({ type }) {
      t.true(type === 'foo' || type === 'bar');
    },
  });
});

test('object traversal reverse', (t) => {
  t.plan(4);

  transform(ast, {
    reverse: true,
    types: 'foo',

    enter({ type }) {
      t.true(type === 'foo');
    },

    exit({ type }) {
      t.true(type === 'foo');
    },
  });
});

test('object traversal remove', (t) => {
  t.plan(1);

  transform(ast, {
    types: 'foo',

    enter({ type }) {
      t.true(type === 'foo');
      return null;
    },

    exit({ type }) {
      t.true(type === 'foo');
      return null;
    },
  });
});

test('object traversal normalized', (t) => {
  t.plan(1);

  const mapper = normalize({
    types: 'foo',

    enter({ type }) {
      t.true(type === 'foo');
      return null;
    },

    exit({ type }) {
      t.true(type === 'foo');
      return null;
    },
  });

  transform(ast, mapper);
});
