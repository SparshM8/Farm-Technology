import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('product categories route is registered before the dynamic product route', async () => {
  const source = await readFile(new URL('../routes/products.js', import.meta.url), 'utf8');
  assert.ok(source.indexOf("router.get('/categories/all'") < source.indexOf("router.get('/:id'"));
});
