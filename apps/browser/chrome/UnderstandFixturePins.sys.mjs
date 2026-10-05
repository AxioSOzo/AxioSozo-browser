// Offline fixture pins. No production authorization is granted.
export const UNDERSTAND_FIXTURE_PYTHON = "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11";
export const UNDERSTAND_FIXTURE_NODE = "/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node";
export const UNDERSTAND_FIXTURE_HELPER = "understand_fixture.py";
export const UNDERSTAND_FIXTURE_INPUTS = Object.freeze([
  {
    "relative": "packages/provider-host/cli.mjs",
    "sha256": "b9997e1ee509341a3e9f96fa6221d90e369d457d29e57a5838989ad58a9ac65c",
    "maxBytes": 65536
  },
  {
    "relative": "packages/provider-host/fixtures/understand/common.mjs",
    "sha256": "a7970176dff6e3f6305331e5a25ac4128d9fd10ec97f4ff326102c3463a37936",
    "maxBytes": 65536
  },
  {
    "relative": "packages/provider-host/fixtures/understand/fake-cli.mjs",
    "sha256": "bb9bc0cf0fcaab18f1fef054a992cf75e267f600c8eee3e486bf64e557160eac",
    "maxBytes": 65536
  },
  {
    "relative": "packages/provider-host/src/discovery.mjs",
    "sha256": "e53c1f8daa20ea3d9162f8b418fe196bd2b3175da3b636e36e674b74b8af4c9a",
    "maxBytes": 65536
  },
  {
    "relative": "packages/provider-host/src/understand.mjs",
    "sha256": "4fb3555468fc4d5983b967c15bd3bd384ba1f24b0de5dc491ec0b27428206496",
    "maxBytes": 65536
  },
  {
    "relative": "packages/provider-host/src/validation.mjs",
    "sha256": "f9bc96f48c21c473061c8ab0fea425879a7d7279554542ccaa81134470f81365",
    "maxBytes": 65536
  },
  {
    "relative": "packages/provider-host/vendor/t3/version.ts",
    "sha256": "d335a12481cab591cf84abc98b1becdec6229674e9e59fd0d8067cf204e8f92f",
    "maxBytes": 65536
  },
  {
    "relative": "policy.json",
    "sha256": "2eb957e809c1b0c3e0edfeab0055460c2c1fbb42816ec55f17d7152bedd1b982",
    "maxBytes": 32768
  },
  {
    "relative": "understand_fixture.py",
    "sha256": "703a5199a6d6cf8831ff32acc4b7f1261ac6663d92a37ec1c9e0ff2bb87f2b1a",
    "maxBytes": 65536
  }
].map(Object.freeze));
export const UNDERSTAND_FIXTURE_BINARIES = Object.freeze([
  {
    "path": "/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11",
    "sha256": "6dca871fed269b213f7c94f2b8aad8dd73e699f2994eabffced9dcd3bd628492",
    "maxBytes": 33554432
  },
  {
    "path": "/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node",
    "sha256": "5d9d3872911e2340a43b707962e68143de8a4e8d54628845c0c4f2de1fb7cd5c",
    "maxBytes": 134217728
  }
].map(Object.freeze));
