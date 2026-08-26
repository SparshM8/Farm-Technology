import assert from 'node:assert/strict';
import test from 'node:test';
import { filterCatalog } from '../src/lib/catalog.js';
import { addGuestCartItem, setGuestItemQuantity } from '../src/lib/guestCart.js';

const products = [
  { id: 'fert-1', name: 'Organic Fertilizer', category: 'fertilizers', description: 'Nutrient-rich soil care', price: 450, stock: 2 },
  { id: 'tool-1', name: 'Garden Spade', category: 'tools', description: 'Stainless steel tilling tool', price: 580, stock: 1 },
];

test('filters the catalog by category and user search terms', () => {
  assert.deepEqual(filterCatalog(products, 'fertilizers', 'organic'), [products[0]]);
  assert.deepEqual(filterCatalog(products, 'all', 'spade'), [products[1]]);
  assert.deepEqual(filterCatalog(products, 'tools', 'organic'), []);
});

test('adds guest items once, respects stock limits, and updates quantities safely', () => {
  const oneFertilizer = addGuestCartItem([], products[0]);
  const twoFertilizers = addGuestCartItem(oneFertilizer, products[0]);
  const cappedFertilizer = addGuestCartItem(twoFertilizers, products[0]);
  assert.equal(oneFertilizer.length, 1);
  assert.equal(twoFertilizers[0].quantity, 2);
  assert.equal(cappedFertilizer[0].quantity, 2);
  assert.equal(setGuestItemQuantity(cappedFertilizer, 'fert-1', 9)[0].quantity, 2);
});
