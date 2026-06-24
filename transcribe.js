// netlify/functions/transcribe.js
// Receives a base64 audio clip from the AI Rx mic, sends it to Deepgram Nova-3 (Medical),
// returns clean transcript text. Key lives server-side as DEEPGRAM_API_KEY (never in HTML).
//
// Request  body: { "audio": "<base64>", "mime": "audio/webm" }
// Response body: { "transcript": "zirconia crown number 8 shade A2" }

exports.handler = async function (event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'DEEPGRAM_API_KEY not set on the server.' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Bad JSON in request body.' }) }; }

  if (!payload.audio) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No audio provided.' }) };
  }

  // Decode the base64 audio clip into raw bytes for Deepgram.
  let audioBuffer;
  try { audioBuffer = Buffer.from(payload.audio, 'base64'); }
  catch (e) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Could not decode audio.' }) }; }

  const mime = payload.mime || 'audio/webm';

  // Deepgram options:
  //   model=nova-3-medical  -> dental/medical vocabulary (Biohorizon, zirconia, distal, etc.)
  //   smart_format=true     -> numbers/punctuation cleaned up ("number 8" -> "#8" style formatting)
  //   punctuate=true        -> sentence punctuation
  //   numerals=true         -> spoken numbers become digits ("nineteen" -> "19")
  const qs = 'model=nova-3-medical&smart_format=true&punctuate=true&numerals=true&language=en';

  try {
    const resp = await fetch('https://api.deepgram.com/v1/listen?' + qs, {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + key,
        'Content-Type': mime
      },
      body: audioBuffer
    });

    const text = await resp.text();
    if (!resp.ok) {
      return { statusCode: resp.status, headers: CORS, body: JSON.stringify({ error: 'Deepgram error', detail: text }) };
    }

    let data;
    try { data = JSON.parse(text); } catch (e) {
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Bad response from Deepgram.' }) };
    }

    // Pull the top transcript out of Deepgram's response shape.
    let transcript = '';
    try {
      transcript = data.results.channels[0].alternatives[0].transcript || '';
    } catch (e) { transcript = ''; }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ transcript: transcript }) };
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Upstream call failed: ' + String(err) }) };
  }
};
