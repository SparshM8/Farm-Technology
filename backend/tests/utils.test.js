import assert from 'assert';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateId } from '../utils/id.js';

// JWT Tests
console.log('🧪 Testing JWT...');
{
  const token = generateToken('test-user-id');
  assert(token, 'Token should be generated');

  const decoded = verifyToken(token);
  assert(decoded.userId === 'test-user-id', 'Token should contain correct userId');
  console.log('  ✓ JWT generation and verification');

  const invalidToken = verifyToken('invalid-token');
  assert(invalidToken === null, 'Invalid token should return null');
  console.log('  ✓ Invalid token handling');
}

// Password Tests
console.log('\n🧪 Testing Password Hashing...');
{
  (async () => {
    const password = 'testPassword123';
    const hash = await hashPassword(password);
    assert(hash !== password, 'Hashed password should differ');
    console.log('  ✓ Password hashing');

    const isValid = await verifyPassword(password, hash);
    assert(isValid === true, 'Valid password should verify');
    console.log('  ✓ Password verification');

    const isInvalid = await verifyPassword('wrongPassword', hash);
    assert(isInvalid === false, 'Wrong password should not verify');
    console.log('  ✓ Invalid password rejection');
  })();
}

// ID Generation Tests
console.log('\n🧪 Testing ID Generation...');
{
  const id1 = generateId();
  const id2 = generateId();
  
  assert(id1, 'ID should be generated');
  assert(id1 !== id2, 'IDs should be unique');
  assert(id1.length > 0, 'ID should not be empty');
  console.log('  ✓ ID generation');
  console.log('  ✓ ID uniqueness');
}

console.log('\n✅ All tests passed!');
