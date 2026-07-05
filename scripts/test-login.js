(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@demo.com', password: 'demo123' }),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('CONTENT-TYPE', res.headers.get('content-type'));
    console.log('BODY:\n', text);
  } catch (e) {
    console.error('ERROR', e.message);
    process.exit(1);
  }
})();
