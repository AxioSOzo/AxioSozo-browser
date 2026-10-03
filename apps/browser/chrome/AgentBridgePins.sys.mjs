// Fixed immutable bridge-bundle pins. Data only; never executes a bridge or client.
export const AGENT_BRIDGE_BUNDLE_SHA256 = "9a03b23584b179763152186d19b954c5b06440fba07b006d935fece194e4daf0";
export const AGENT_BRIDGE_SOURCE_NODE = "/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node";
export const AGENT_BRIDGE_FILES = Object.freeze([
  {
    "relative": "package.json",
    "sha256": "38aecdf39990e070506ac1a2064a9f2897f6df1dc5a4df2eff4ba469bb608506",
    "maxBytes": 65536,
    "mode": 256
  },
  {
    "relative": "bin/axiosozo-agent-bridge.mjs",
    "sha256": "3efd57e4e38b0b23b3acf9a2e01a55b860e181e464b836ec599c9368857a4d05",
    "maxBytes": 65536,
    "mode": 256
  },
  {
    "relative": "src/server.mjs",
    "sha256": "c96b7336ff6a8fc9552f2335b34578faafb5b16fb08668367a0c7be7b9c2aca0",
    "maxBytes": 65536,
    "mode": 256
  },
  {
    "relative": "src/channel.mjs",
    "sha256": "ebdf3af693d5c0f2e8fc6391fab497521a1d51b594d236fcb9e1df436b0fe7ea",
    "maxBytes": 65536,
    "mode": 256
  },
  {
    "relative": "src/jsonl.mjs",
    "sha256": "c08f37ba38b9c389b199005266e5eca28fb074cd8d70286c87317563eefe3125",
    "maxBytes": 65536,
    "mode": 256
  },
  {
    "relative": "src/tools.mjs",
    "sha256": "ba8f64908ff3f80d3f3e0b60ea26ac77fbbd65d9ede43b59f0a51491fbdb5e0c",
    "maxBytes": 65536,
    "mode": 256
  },
  {
    "relative": "node",
    "sha256": "5d9d3872911e2340a43b707962e68143de8a4e8d54628845c0c4f2de1fb7cd5c",
    "maxBytes": 134217728,
    "mode": 320
  }
].map(Object.freeze));
