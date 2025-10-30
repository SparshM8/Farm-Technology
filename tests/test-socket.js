// Simple Socket.IO client test to verify chatbot responds
const io = require('socket.io-client');

const SERVER = process.env.SERVER_URL || 'http://localhost:3000';
const TEST_MESSAGE = 'Which fertilizer is best for wheat?';
const TIMEOUT_MS = 8000;

console.log(`Connecting to ${SERVER} ...`);
const socket = io(SERVER, { transports: ['websocket'], timeout: 5000 });

let timeout = setTimeout(() => {
  console.error('Test timeout: no bot reply received');
  socket.close();
  process.exit(2);
}, TIMEOUT_MS);

socket.on('connect', () => {
  console.log('Connected to server (id=' + socket.id + ')');
  console.log('Sending test question to chatbot:', TEST_MESSAGE);
  socket.emit('chat message', TEST_MESSAGE);
});

socket.on('chat message', (msg) => {
  console.log('Bot reply received:');
  console.log(msg);
  clearTimeout(timeout);
  socket.close();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('Socket connect error:', err.message || err);
});

socket.on('error', (err) => {
  console.error('Socket error:', err);
});
