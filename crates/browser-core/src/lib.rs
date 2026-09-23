//! Small policy coordinator. It authorizes intent; it never claims an engine executed it.
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::io::{self, Read};

pub const VERSION: u32 = 1;
pub const MAX_FRAME: usize = 64 * 1024;
pub const MAX_GENERATION: u64 = 9_007_199_254_740_991;

pub fn mint_id() -> io::Result<String> {
    let mut bytes = [0u8; 32];
    std::fs::File::open("/dev/urandom")?.read_exact(&mut bytes)?;
    Ok(bytes.iter().map(|b| format!("{b:02x}")).collect())
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Engine {
    Gecko,
    Chromium,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BrowserTarget {
    pub tab_id: String,
    pub engine: Engine,
    pub engine_instance: String,
    pub native_target_id: String,
    pub identity: String,
    pub document_generation: u64,
    pub navigation_generation: u64,
    pub private_mode: bool,
}

#[derive(Clone, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Scope {
    Observe,
    Navigate,
    Back,
    Forward,
    Reload,
    Close,
    Devtools,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Grant {
    pub id: String,
    pub target: BrowserTarget,
    pub scopes: Vec<Scope>,
    pub expires_at_ms: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Envelope {
    pub version: u32,
    pub request_id: String,
    pub session_id: String,
    pub token: String,
    pub body: Request,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "method", rename_all = "snake_case", deny_unknown_fields)]
pub enum Request {
    Capabilities,
    RegisterTarget {
        target: BrowserTarget,
    },
    UpdateTarget {
        previous: BrowserTarget,
        target: BrowserTarget,
    },
    CreateTarget {
        engine: Engine,
        engine_instance: String,
        native_target_id: String,
        identity: String,
        private_mode: bool,
    },
    AdvanceDocument {
        target: BrowserTarget,
        identity: String,
    },
    Grant {
        target: BrowserTarget,
        scopes: Vec<Scope>,
        ttl_ms: u64,
    },
    Authorize {
        grant_id: String,
        target: BrowserTarget,
        scope: Scope,
    },
    CloseTarget {
        target: BrowserTarget,
    },
    Shutdown,
}

#[derive(Debug, Serialize)]
pub struct Response {
    pub version: u32,
    pub request_id: String,
    pub session_id: String,
    pub status: &'static str,
    pub result: serde_json::Value,
}

pub struct Coordinator {
    token: String,
    session: String,
    targets: HashMap<String, BrowserTarget>,
    grants: HashMap<String, Grant>,
    // Never replay a request, including rejected requests. Bounded by session lifetime.
    requests: HashSet<String>,
}

fn valid_id(s: &str) -> bool {
    !s.is_empty()
        && s.len() <= 128
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"-_:./".contains(&b))
}

fn valid_identity(s: &str) -> bool {
    !s.is_empty() && s.len() <= 4096 && !s.chars().any(char::is_control)
}

fn valid_target(target: &BrowserTarget) -> bool {
    valid_id(&target.tab_id)
        && valid_id(&target.engine_instance)
        && valid_id(&target.native_target_id)
        && valid_identity(&target.identity)
        && target.document_generation <= MAX_GENERATION
        && target.navigation_generation <= MAX_GENERATION
}

fn equal_secret(a: &str, b: &str) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.bytes().zip(b.bytes()).fold(0u8, |v, (a, b)| v | (a ^ b)) == 0
}

impl Coordinator {
    pub fn new(token: String, session: String) -> Result<Self, &'static str> {
        if token.len() != 64 || !token.bytes().all(|b| b.is_ascii_hexdigit()) || !valid_id(&session)
        {
            return Err("invalid_bootstrap");
        }
        Ok(Self {
            token,
            session,
            targets: HashMap::new(),
            grants: HashMap::new(),
            requests: HashSet::new(),
        })
    }

    fn current(&self, target: &BrowserTarget) -> bool {
        self.targets.get(&target.tab_id) == Some(target)
    }

    pub fn handle(&mut self, message: Envelope, now_ms: u64) -> Response {
        let respond = |status, result| Response {
            version: VERSION,
            request_id: message.request_id.clone(),
            session_id: self.session.clone(),
            status,
            result,
        };
        let reject = |reason| respond("rejected", serde_json::json!({"reason": reason}));
        if message.version != VERSION {
            return reject("schema_version");
        }
        if !equal_secret(&message.token, &self.token) || message.session_id != self.session {
            return reject("unauthenticated");
        }
        if !valid_id(&message.request_id) {
            return reject("invalid_request_id");
        }
        if self.requests.len() >= 100_000 {
            return reject("session_request_limit");
        }
        if !self.requests.insert(message.request_id.clone()) {
            return reject("duplicate_request_no_replay");
        }
        self.grants.retain(|_, grant| grant.expires_at_ms > now_ms);
        match message.body {
            Request::Capabilities => respond(
                "completed",
                serde_json::json!({"policy_only": true, "engine_execution": false, "transport": "inherited_stdio", "automatic_browser_control": false}),
            ),
            Request::RegisterTarget { target } => {
                // This endpoint belongs only to the authenticated browser parent.
                // Provider processes never receive this stream or its root token.
                if !valid_target(&target) {
                    return reject("invalid_target");
                }
                if self.targets.len() >= 4096 {
                    return reject("target_limit");
                }
                if self.targets.contains_key(&target.tab_id)
                    || self.targets.values().any(|current| {
                        current.engine_instance == target.engine_instance
                            && current.native_target_id == target.native_target_id
                    })
                {
                    return reject("duplicate_target");
                }
                self.targets.insert(target.tab_id.clone(), target.clone());
                respond("completed", serde_json::json!(target))
            }
            Request::UpdateTarget { previous, target } => {
                if !self.current(&previous) {
                    return reject("stale_target");
                }
                if !valid_target(&target)
                    || target.tab_id != previous.tab_id
                    || target.engine != previous.engine
                    || target.engine_instance != previous.engine_instance
                    || target.native_target_id != previous.native_target_id
                    || target.private_mode != previous.private_mode
                    || target.document_generation < previous.document_generation
                    || target.navigation_generation < previous.navigation_generation
                    || (target.identity != previous.identity
                        && target.document_generation == previous.document_generation
                        && target.navigation_generation == previous.navigation_generation)
                {
                    return reject("invalid_target_transition");
                }
                if target != previous {
                    self.grants
                        .retain(|_, grant| grant.target.tab_id != target.tab_id);
                }
                self.targets.insert(target.tab_id.clone(), target.clone());
                respond("completed", serde_json::json!(target))
            }
            Request::CreateTarget {
                engine,
                engine_instance,
                native_target_id,
                identity,
                private_mode,
            } => {
                if !valid_id(&engine_instance)
                    || !valid_id(&native_target_id)
                    || !valid_identity(&identity)
                {
                    return reject("invalid_target");
                }
                if self.targets.len() >= 4096 {
                    return reject("target_limit");
                }
                if self.targets.values().any(|t| {
                    t.engine_instance == engine_instance && t.native_target_id == native_target_id
                }) {
                    return reject("duplicate_native_target");
                }
                let Ok(tab_id) = mint_id() else {
                    return reject("entropy_unavailable");
                };
                let target = BrowserTarget {
                    tab_id,
                    engine,
                    engine_instance,
                    native_target_id,
                    identity,
                    private_mode,
                    document_generation: 0,
                    navigation_generation: 0,
                };
                self.targets.insert(target.tab_id.clone(), target.clone());
                respond("completed", serde_json::json!(target))
            }
            Request::AdvanceDocument { target, identity } => {
                if !self.current(&target) {
                    return reject("stale_target");
                }
                if !valid_identity(&identity) {
                    return reject("invalid_identity");
                }
                let Some(document_generation) = target.document_generation.checked_add(1) else {
                    return reject("generation_exhausted");
                };
                let Some(navigation_generation) = target.navigation_generation.checked_add(1)
                else {
                    return reject("generation_exhausted");
                };
                if document_generation > MAX_GENERATION || navigation_generation > MAX_GENERATION {
                    return reject("generation_exhausted");
                }
                let next = BrowserTarget {
                    identity,
                    document_generation,
                    navigation_generation,
                    ..target
                };
                self.grants.retain(|_, g| g.target.tab_id != next.tab_id);
                self.targets.insert(next.tab_id.clone(), next.clone());
                respond("completed", serde_json::json!(next))
            }
            Request::Grant {
                target,
                scopes,
                ttl_ms,
            } => {
                if !self.current(&target) {
                    return reject("stale_target");
                }
                // Private documents are excluded from ALL provider context and control by default.
                if target.private_mode {
                    return reject("private_target");
                }
                if scopes.is_empty() || scopes.len() > 7 || !(1..=30_000).contains(&ttl_ms) {
                    return reject("invalid_grant");
                }
                if self.grants.len() >= 4096 {
                    return reject("grant_limit");
                }
                let Ok(id) = mint_id() else {
                    return reject("entropy_unavailable");
                };
                let Some(expires_at_ms) = now_ms.checked_add(ttl_ms) else {
                    return reject("deadline_overflow");
                };
                let grant = Grant {
                    id,
                    target,
                    scopes,
                    expires_at_ms,
                };
                self.grants.insert(grant.id.clone(), grant.clone());
                respond("completed", serde_json::json!(grant))
            }
            Request::Authorize {
                grant_id,
                target,
                scope,
            } => {
                if !self.current(&target) {
                    return reject("stale_target");
                }
                let Some(grant) = self.grants.get(&grant_id) else {
                    return reject("expired_or_unknown_grant");
                };
                if grant.target != target || !grant.scopes.contains(&scope) {
                    return reject("scope_or_identity_mismatch");
                }
                // Every grant is one-use, even for observation. Engine must revalidate before dispatch.
                self.grants.remove(&grant_id);
                respond(
                    "authorized",
                    serde_json::json!({"executed": false, "target": target, "scope": scope}),
                )
            }
            Request::CloseTarget { target } => {
                if !self.current(&target) {
                    return reject("stale_target");
                }
                self.targets.remove(&target.tab_id);
                self.grants.retain(|_, g| g.target.tab_id != target.tab_id);
                respond(
                    "completed",
                    serde_json::json!({"registry_closed": true, "engine_executed": false}),
                )
            }
            Request::Shutdown => respond("shutdown", serde_json::json!({})),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn core() -> Coordinator {
        Coordinator::new("a".repeat(64), "session-1".into()).unwrap()
    }
    fn msg(id: &str, body: Request) -> Envelope {
        Envelope {
            version: VERSION,
            request_id: id.into(),
            session_id: "session-1".into(),
            token: "a".repeat(64),
            body,
        }
    }
    fn target(c: &mut Coordinator, private_mode: bool) -> BrowserTarget {
        serde_json::from_value(
            c.handle(
                msg(
                    "create",
                    Request::CreateTarget {
                        engine: Engine::Gecko,
                        engine_instance: "engine-1".into(),
                        native_target_id: "native-1".into(),
                        identity: "https://fixture.invalid".into(),
                        private_mode,
                    },
                ),
                0,
            )
            .result,
        )
        .unwrap()
    }
    fn grant(c: &mut Coordinator, t: BrowserTarget) -> Grant {
        serde_json::from_value(
            c.handle(
                msg(
                    "grant",
                    Request::Grant {
                        target: t,
                        scopes: vec![Scope::Navigate],
                        ttl_ms: 100,
                    },
                ),
                10,
            )
            .result,
        )
        .unwrap()
    }
    #[test]
    fn no_web_origin_or_extra_fields() {
        let value = serde_json::json!({"version":1,"request_id":"1","session_id":"s","token":"a".repeat(64),"origin":"https://evil.invalid","body":{"method":"capabilities"}});
        assert!(serde_json::from_value::<Envelope>(value).is_err());
        assert!(serde_json::from_value::<Request>(
            serde_json::json!({"method":"shell","command":"id"})
        )
        .is_err());
    }
    #[test]
    fn authentication_and_session_isolation() {
        let mut c = core();
        let mut m = msg("r1", Request::Capabilities);
        m.token = "b".repeat(64);
        assert_eq!(c.handle(m, 0).result["reason"], "unauthenticated");
        let mut m = msg("r2", Request::Capabilities);
        m.session_id = "other-account".into();
        assert_eq!(c.handle(m, 0).status, "rejected");
        assert_eq!(
            c.handle(msg("r3", Request::Capabilities), 0).status,
            "completed"
        );
    }
    #[test]
    fn private_context_never_granted() {
        let mut c = core();
        let t = target(&mut c, true);
        assert_eq!(
            c.handle(
                msg(
                    "grant",
                    Request::Grant {
                        target: t,
                        scopes: vec![Scope::Observe],
                        ttl_ms: 100
                    }
                ),
                0
            )
            .result["reason"],
            "private_target"
        );
    }
    #[test]
    fn stale_document_invalidates_grant() {
        let mut c = core();
        let t = target(&mut c, false);
        let g = grant(&mut c, t.clone());
        c.handle(
            msg(
                "nav",
                Request::AdvanceDocument {
                    target: t.clone(),
                    identity: "https://other.invalid".into(),
                },
            ),
            20,
        );
        assert_eq!(
            c.handle(
                msg(
                    "act",
                    Request::Authorize {
                        grant_id: g.id,
                        target: t,
                        scope: Scope::Navigate
                    }
                ),
                21
            )
            .result["reason"],
            "stale_target"
        );
    }
    #[test]
    fn expiry_scope_and_one_use() {
        let mut c = core();
        let t = target(&mut c, false);
        let g = grant(&mut c, t.clone());
        assert_eq!(
            c.handle(
                msg(
                    "wrongscope",
                    Request::Authorize {
                        grant_id: g.id.clone(),
                        target: t.clone(),
                        scope: Scope::Close
                    }
                ),
                50
            )
            .status,
            "rejected"
        );
        assert_eq!(
            c.handle(
                msg(
                    "act",
                    Request::Authorize {
                        grant_id: g.id.clone(),
                        target: t.clone(),
                        scope: Scope::Navigate
                    }
                ),
                50
            )
            .status,
            "authorized"
        );
        assert_eq!(
            c.handle(
                msg(
                    "act2",
                    Request::Authorize {
                        grant_id: g.id,
                        target: t,
                        scope: Scope::Navigate
                    }
                ),
                51
            )
            .status,
            "rejected"
        );
        let mut c = core();
        let t = target(&mut c, false);
        let g = grant(&mut c, t.clone());
        assert_eq!(
            c.handle(
                msg(
                    "expired",
                    Request::Authorize {
                        grant_id: g.id,
                        target: t,
                        scope: Scope::Navigate
                    }
                ),
                110
            )
            .status,
            "rejected"
        );
    }
    #[test]
    fn replay_and_reconnect_never_repeat_action() {
        let mut c = core();
        let t = target(&mut c, false);
        let g = grant(&mut c, t.clone());
        let m = msg(
            "act",
            Request::Authorize {
                grant_id: g.id,
                target: t,
                scope: Scope::Navigate,
            },
        );
        assert_eq!(c.handle(m.clone(), 20).status, "authorized");
        assert_eq!(
            c.handle(m.clone(), 21).result["reason"],
            "duplicate_request_no_replay"
        );
        assert_eq!(core().handle(m, 22).result["reason"], "stale_target");
    }
    #[test]
    fn forged_engine_identity_fails() {
        let mut c = core();
        let t = target(&mut c, false);
        let g = grant(&mut c, t.clone());
        let fake = BrowserTarget {
            engine: Engine::Chromium,
            ..t
        };
        assert_eq!(
            c.handle(
                msg(
                    "fake",
                    Request::Authorize {
                        grant_id: g.id,
                        target: fake,
                        scope: Scope::Navigate
                    }
                ),
                20
            )
            .result["reason"],
            "stale_target"
        );
    }
    #[test]
    fn target_ids_are_browser_minted_and_unique() {
        let mut c = core();
        let t = target(&mut c, false);
        assert_eq!(t.tab_id.len(), 64);
        assert_ne!(mint_id().unwrap(), mint_id().unwrap());
    }

    #[test]
    fn chrome_registration_preserves_real_target_and_rejects_rebinding() {
        let mut c = core();
        let browser_target = BrowserTarget {
            tab_id: "chrome-tab-1".into(),
            engine: Engine::Gecko,
            engine_instance: "chrome-window-1".into(),
            native_target_id: "42".into(),
            identity: "http://127.0.0.1:8123".into(),
            document_generation: 1,
            navigation_generation: 1,
            private_mode: false,
        };
        assert_eq!(
            c.handle(
                msg(
                    "register",
                    Request::RegisterTarget {
                        target: browser_target.clone()
                    }
                ),
                0
            )
            .status,
            "completed"
        );
        assert_eq!(
            c.handle(
                msg(
                    "duplicate",
                    Request::RegisterTarget {
                        target: browser_target.clone()
                    }
                ),
                0
            )
            .result["reason"],
            "duplicate_target"
        );
        let forged = BrowserTarget {
            engine: Engine::Chromium,
            ..browser_target.clone()
        };
        assert_eq!(
            c.handle(
                msg(
                    "rebind",
                    Request::UpdateTarget {
                        previous: browser_target.clone(),
                        target: forged
                    }
                ),
                1
            )
            .result["reason"],
            "invalid_target_transition"
        );
        let issued = grant(&mut c, browser_target.clone());
        let next = BrowserTarget {
            navigation_generation: 2,
            ..browser_target.clone()
        };
        assert_eq!(
            c.handle(
                msg(
                    "sync",
                    Request::UpdateTarget {
                        previous: browser_target.clone(),
                        target: next.clone()
                    }
                ),
                20
            )
            .status,
            "completed"
        );
        assert_eq!(
            c.handle(
                msg(
                    "stale-action",
                    Request::Authorize {
                        grant_id: issued.id,
                        target: browser_target.clone(),
                        scope: Scope::Navigate
                    }
                ),
                21
            )
            .result["reason"],
            "stale_target"
        );
        assert_eq!(
            c.handle(
                msg(
                    "rewind",
                    Request::UpdateTarget {
                        previous: next,
                        target: browser_target
                    }
                ),
                22
            )
            .result["reason"],
            "invalid_target_transition"
        );
    }

    #[test]
    fn generations_are_lossless_in_javascript() {
        let mut c = core();
        let target = target(&mut c, false);
        let changed = BrowserTarget {
            document_generation: MAX_GENERATION + 1,
            ..target.clone()
        };
        assert_eq!(
            c.handle(
                msg(
                    "overflow",
                    Request::UpdateTarget {
                        previous: target,
                        target: changed
                    }
                ),
                1
            )
            .result["reason"],
            "invalid_target_transition"
        );
    }
}
