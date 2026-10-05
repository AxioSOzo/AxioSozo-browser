/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// DOM-free: project icon bytes (read through the containment reader) → a
// data: URL the about:axiosozo page shows in an <img>. Only images whose bytes
// match their type are returned; SVG must be plain UTF-8 markup without
// entities, scripts or external references. The page CSP allows data: images.
export const MAX_ICON_BYTES = 262144;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const starts = (bytes, prefix) => prefix.every((value, index) => bytes[index] === value);

/** The image type of `bytes` for a file named `path`, or null. */
export function iconType(bytes, path) {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 4 || bytes.byteLength > MAX_ICON_BYTES || typeof path !== "string") return null;
  const ext = /\.([A-Za-z0-9]{1,8})$/u.exec(path)?.[1].toLowerCase();
  if (ext === "png" && starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if ((ext === "jpg" || ext === "jpeg") && starts(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (ext === "webp" && starts(bytes, [0x52, 0x49, 0x46, 0x46]) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  if (ext === "ico" && starts(bytes, [0x00, 0x00, 0x01, 0x00])) return "image/x-icon";
  if (ext === "svg") {
    let text;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return null; }
    const head = text.slice(0, 4096).replace(/^﻿/u, "").replace(/^\s*(<\?xml[^>]*\?>\s*)?(<!--[\s\S]*?-->\s*)*/u, "");
    if (!/^<svg[\s>]/iu.test(head)) return null;
    // Rendered as an image these cannot run or load anything, but they are
    // never what an icon needs: refuse rather than reason about them.
    if (/<!(DOCTYPE|ENTITY)|<script|<foreignObject|\bon[a-z]+\s*=|(?:href|src)\s*=\s*["']\s*(?!#|data:image\/)[a-z]/iu.test(text)) return null;
    return "image/svg+xml";
  }
  return null;
}

/** Standard base64 (with padding) of `bytes`. */
export function encodeBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    out += ALPHABET[a >> 2] + ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)]
      + (b === undefined ? "=" : ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)])
      + (c === undefined ? "=" : ALPHABET[c & 63]);
  }
  return out;
}

/** A data: URL for an icon, or null when the bytes are not a supported image. */
export function iconDataUrl(bytes, path) {
  const type = iconType(bytes, path);
  return type ? `data:${type};base64,${encodeBase64(bytes)}` : null;
}

/**
 * Reads one icon file through the containment reader (ProjectReader): exact
 * root and file identities, the core's iconRefusal policy (image path, regular
 * file, at most MAX_ICON_BYTES) and a final type check. The caller has already
 * admitted `canonicalRoot`. Returns a data: URL or null; never throws for a
 * missing, refused or unsupported file.
 */
export async function readProjectIcon({ reader, core, canonicalRoot, path }) {
  if (typeof core?.iconRefusal !== "function" || typeof path !== "string") return null;
  try {
    const root = await reader.rootMetadata(canonicalRoot);
    if (root?.type !== "directory") return null;
    const target = await reader.fileMetadata({ root: canonicalRoot, relative: path, expectedRoot: root.identity });
    // The helper opens every component without following links, so the
    // resolved path is the requested one or the request fails.
    if (!target || core.iconRefusal({ path, resolvedPath: path, isFile: target.type === "regular", size: target.size }) !== null) return null;
    const bytes = await reader.readContained({ root: canonicalRoot, relative: path, expectedRoot: root.identity,
      expectedFile: target.identity, maxBytes: MAX_ICON_BYTES + 1 });
    return iconDataUrl(bytes, path);
  } catch (error) {
    if (error?.code === "READ_CONTAINMENT_UNAVAILABLE") throw error;
    return null;
  }
}
