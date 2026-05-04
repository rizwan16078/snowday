const https = require('https');
https.get('https://freeipapi.com/api/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('freeipapi:', data.slice(0, 200)));
});
https.get('https://ipapi.co/json/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('ipapi.co:', data.slice(0, 200)));
});
