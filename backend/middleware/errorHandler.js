export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.message === 'UNIQUE constraint failed') {
    return res.status(409).json({ error: 'This item already exists' });
  }

  if (err.status === 400) {
    return res.status(400).json({ error: err.message });
  }

  if (err.status === 404) {
    return res.status(404).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Endpoint not found' });
}
