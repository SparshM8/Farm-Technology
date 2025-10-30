const path = require('path');
// Use a test DB file to avoid clobbering development DB
process.env.TEST_DB_FILE = path.join(__dirname, 'data.test.db');

// supertest is required below as `request`
const fs = require('fs');

// Ensure fresh test DB each run
try { fs.unlinkSync(process.env.TEST_DB_FILE); } catch (e) {}

const request = require('supertest');
const { app, db } = require('../server');

describe('Checkout API', () => {
  let createdProductId = null;

  afterAll((done) => {
    try { db.close(() => done()); } catch (e) { done(); }
  });

  test('create product (admin) and checkout', async () => {
    // use an agent to persist session cookies
    const agent = request.agent(app);

    // login as admin
    const loginRes = await agent.post('/api/admin/login').send({ password: process.env.ADMIN_PASSWORD || 'PASSCODE' }).expect(200);
    expect(loginRes.body).toHaveProperty('status', 'ok');

    // create a product
    const prod = { title: 'Test Fertilizer', image: '/uploads/test.jpg', price: '100', description: 'Test' };
    const createRes = await agent.post('/api/products').send(prod).expect(200);
    expect(createRes.body).toHaveProperty('item');
    createdProductId = createRes.body.item.id;

    // checkout with the product
    const orderPayload = {
      customerName: 'Test User',
      customerAddress: '123 Farm Lane',
      customerPhone: '9999999999',
      items: [{ id: createdProductId, qty: 2, title: prod.title }]
    };

    const checkoutRes = await request(app).post('/api/checkout').send(orderPayload).expect(200);
    expect(checkoutRes.body).toHaveProperty('status', 'ok');
    expect(checkoutRes.body).toHaveProperty('orderId');

    const ordersRes = await agent.get('/api/orders').expect(200);
    expect(Array.isArray(ordersRes.body)).toBe(true);
    const found = ordersRes.body.find(o => o.id === checkoutRes.body.orderId);
    expect(found).toBeTruthy();
  }, 20000);
});
