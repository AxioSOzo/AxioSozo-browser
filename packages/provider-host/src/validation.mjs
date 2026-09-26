export class ProviderError extends Error {
  constructor(code, detail) { super(detail); this.name = 'ProviderError'; this.code = code; }
}
export function requireValue(condition, code, detail) {
  if (!condition) throw new ProviderError(code, detail);
}
export function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function id(value, name = 'id') {
  requireValue(typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,160}$/.test(value), 'INVALID_INPUT', `Invalid ${name}`);
  return value;
}
export function exactKeys(value, allowed) {
  requireValue(object(value) && Object.keys(value).every(key => allowed.includes(key)), 'INVALID_INPUT', 'Unknown input field');
}
export function prompt(value) {
  requireValue(typeof value === 'string' && value.length > 0 && Buffer.byteLength(value) <= 32768, 'INVALID_INPUT', 'Prompt must contain 1–32768 bytes');
  return value;
}

// Minimal draft-07 evaluator for the actual generated Codex schemas; unsupported
// schema assertions fail closed. No coercion, default insertion, or remote $ref.
export function matchesSchema(value, schema, root, depth = 0) {
  if (depth > 80 || schema === false) return false;
  if (schema === true || !schema) return true;
  if (schema.$ref) {
    if (!schema.$ref.startsWith('#/')) return false;
    const resolved = schema.$ref.slice(2).split('/').reduce((node, key) => node?.[key.replaceAll('~1', '/').replaceAll('~0', '~')], root);
    return !!resolved && matchesSchema(value, resolved, root, depth + 1);
  }
  const supported = new Set(['$schema', '$id', '$defs', 'definitions', 'title', 'description', 'default', 'examples', 'deprecated', 'readOnly', 'writeOnly', 'type', 'properties', 'required', 'additionalProperties', 'items', 'enum', 'const', 'oneOf', 'anyOf', 'allOf', 'minimum', 'maximum', 'minItems', 'maxItems', 'minLength', 'maxLength', 'pattern', 'format']);
  if (Object.keys(schema).some(key => !supported.has(key))) return false;
  if (schema.enum && !schema.enum.some(item => JSON.stringify(item) === JSON.stringify(value))) return false;
  if ('const' in schema && JSON.stringify(schema.const) !== JSON.stringify(value)) return false;
  for (const kind of ['anyOf', 'oneOf', 'allOf']) {
    if (!schema[kind]) continue;
    const count = schema[kind].filter(item => matchesSchema(value, item, root, depth + 1)).length;
    if (kind === 'anyOf' && count === 0 || kind === 'oneOf' && count !== 1 || kind === 'allOf' && count !== schema[kind].length) return false;
  }
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  if (types.length && !types.some(type => type === 'null' ? value === null : type === 'object' ? object(value) : type === 'array' ? Array.isArray(value) : type === 'integer' ? Number.isSafeInteger(value) : typeof value === type && (type !== 'number' || Number.isFinite(value)))) return false;
  if (object(value)) {
    if (schema.required?.some(key => !(key in value))) return false;
    for (const [key, item] of Object.entries(value)) {
      const rule = schema.properties?.[key] ?? schema.additionalProperties;
      if (rule === false || rule && !matchesSchema(item, rule, root, depth + 1)) return false;
    }
  }
  if (Array.isArray(value) && (value.length < (schema.minItems ?? 0) || value.length > (schema.maxItems ?? Infinity) || value.some(item => schema.items && !matchesSchema(item, schema.items, root, depth + 1)))) return false;
  if (typeof value === 'number' && (value < (schema.minimum ?? -Infinity) || value > (schema.maximum ?? Infinity))) return false;
  if (typeof value === 'string' && (value.length < (schema.minLength ?? 0) || value.length > (schema.maxLength ?? Infinity) || schema.pattern && !new RegExp(schema.pattern).test(value))) return false;
  return true;
}
