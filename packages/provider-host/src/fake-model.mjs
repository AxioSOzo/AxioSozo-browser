// Loopback stand-in for the two model APIs, used only by the offline client checks
// (checks.mjs). It lets the real installed Codex / Claude Code run the exact Ask AI argv,
// under the real sandbox profile, without a model call or any credential: the check gives
// each client a synthetic home and a placeholder key, and network access is loopback only.
//
// It records shape facts only (which tools the client offered the model, whether planted
// marker strings reached the model input, body size). Headers are never read or kept.
import { createServer } from 'node:http';

const MAX_BODY = 4 * 1024 * 1024;

function toolNames(body) {
  const tools = Array.isArray(body?.tools) ? body.tools : [];
  return tools.map(tool => {
    if (tool?.type === 'namespace' && Array.isArray(tool.tools)) return `${tool.name ?? 'namespace'}:${tool.tools.map(item => item?.name ?? '?').join('+')}`;
    return String(tool?.name ?? tool?.type ?? 'tool');
  }).slice(0, 64);
}

function sse(res, events) {
  res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
  for (const [type, data] of events) res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
  res.end();
}

function responsesEvents(text) {
  const item = 'msg_axiosozo_check';
  return [
    ['response.created', { response: { id: 'resp_axiosozo_check' } }],
    ['response.output_item.added', { output_index: 0, item: { type: 'message', role: 'assistant', id: item, content: [] } }],
    ['response.content_part.added', { item_id: item, output_index: 0, content_index: 0, part: { type: 'output_text', text: '' } }],
    ['response.output_text.delta', { delta: text, item_id: item, output_index: 0, content_index: 0 }],
    ['response.output_item.done', { output_index: 0, item: { type: 'message', role: 'assistant', id: item, content: [{ type: 'output_text', text }] } }],
    ['response.completed', { response: { id: 'resp_axiosozo_check', usage: { input_tokens: 1, input_tokens_details: null, output_tokens: 1, output_tokens_details: null, total_tokens: 2 } } }],
  ];
}

function messagesEvents(text, model) {
  return [
    ['message_start', { message: { id: 'msg_axiosozo_check', type: 'message', role: 'assistant', model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } }],
    ['content_block_start', { index: 0, content_block: { type: 'text', text: '' } }],
    ['content_block_delta', { index: 0, delta: { type: 'text_delta', text } }],
    ['content_block_stop', { index: 0 }],
    ['message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 1 } }],
    ['message_stop', {}],
  ];
}

/**
 * Starts the stand-in on 127.0.0.1 with an ephemeral port. `markers` are strings the check
 * planted in the client's synthetic customization files; each request records which of
 * them reached the model input. Resolves { port, requests, close() }.
 */
export function startFakeModel({ reply, markers = [] }) {
  const requests = [];
  const server = createServer((req, res) => {
    let size = 0; const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { res.writeHead(413).end(); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (res.writableEnded) return;
      const raw = Buffer.concat(chunks).toString('utf8');
      let body = null; try { body = raw ? JSON.parse(raw) : null; } catch { /* recorded as unparsed */ }
      const url = String(req.url ?? '');
      const kind = req.method === 'POST' && /\/responses(?:\?|$)/u.test(url) ? 'responses'
        : req.method === 'POST' && /\/v1\/messages(?:\?|$)/u.test(url) ? 'messages' : 'other';
      requests.push({ kind, parsed: body !== null, bytes: size, tools: kind === 'other' ? [] : toolNames(body),
        markers: markers.filter(marker => raw.includes(marker)) });
      if (kind === 'responses') sse(res, responsesEvents(reply));
      else if (kind === 'messages') sse(res, messagesEvents(reply, typeof body?.model === 'string' ? body.model.slice(0, 80) : 'model'));
      else { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{"error":{"type":"not_found","message":"not found"}}'); }
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({
      port: server.address().port, requests,
      close: () => new Promise(done => { server.closeAllConnections?.(); server.close(() => done()); }),
    }));
  });
}
