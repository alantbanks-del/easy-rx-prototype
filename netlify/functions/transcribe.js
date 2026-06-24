// netlify/functions/transcribe.js
// Mints a SHORT-LIVED Deepgram token so the browser can open a live streaming
// WebSocket directly to Deepgram for real-time transcription (words appear as you talk).
// Your real key (DEEPGRAM_API_KEY, must have MEMBER permission) never leaves the server;
// only a 30-second disposable token is sent to the browser.
//
// GET/POST -> { "access_token": "<jwt>", "expires_in": 30 }

exports.handler = async function (event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'DEEPGRAM_API_KEY not set on the server.' }) };
  }

  try {
    // Ask Deepgram for a temporary token (default 30s TTL, usage:write).
    const resp = await fetch('https://api.deepgram.com/v1/auth/grant', {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ttl_seconds: 60 })   // 60s is plenty to open the socket
    });

    const text = await resp.text();
    if (!resp.ok) {
      return { statusCode: resp.status, headers: CORS, body: JSON.stringify({ error: 'Deepgram token error', detail: text }) };
    }
    // Pass Deepgram's response straight through ({ access_token, expires_in }).
    return { statusCode: 200, headers: CORS, body: text };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Upstream call failed: ' + String(err) }) };
  }
};
