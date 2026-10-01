// AxioSozo engine-view accessibility probe (test tool, not shipped; zen.py does not
// mirror tests/). Acts as an assistive client through the public AXUIElement API,
// the way VoiceOver does, against ONE AxioSozo Dev process given by pid. It never
// touches any other application, never speaks, and never changes TCC settings.
//
// Build (on the project build volume, see AGENTS.md):
//   xcrun swiftc -O ax_probe.swift -o "$OUT/ax_probe"
//
// Usage: ax_probe PID COMMAND [ARGS]
//   trusted                    {"ax_trusted":bool}; never prompts. Needs System Settings >
//                              Privacy & Security > Accessibility for the calling app.
//   activate                   set AXEnhancedUserInterface=true on the application element
//                              (the signal VoiceOver sends; Gecko's GeckoNSApplication
//                              accessibilitySetValue:forAttribute: turns platform a11y on).
//   deactivate                 set AXEnhancedUserInterface=false (VoiceOver quitting).
//   dump [SECONDS]             find the Chromium canvas group in the front window, query its
//                              AXChildren (this is the request that enables the tab's tree)
//                              and poll until the web area has content; print the subtree.
//   press TEXT                 AXPress the first button whose title/description contains TEXT.
//   setvalue ROLE TEXT VALUE   set AXValue of the first ROLE (e.g. AXTextField) element whose
//                              title/description/placeholder contains TEXT.
//   find ROLE TEXT             print one element (role, subrole, title, value, frame).
// Output is one JSON object on stdout. Exit 0 on success, 2 when the element is missing,
// 3 when not trusted.
import ApplicationServices
import Foundation

func out(_ value: Any) {
  let data = try! JSONSerialization.data(withJSONObject: value, options: [.prettyPrinted, .sortedKeys])
  FileHandle.standardOutput.write(data); FileHandle.standardOutput.write("\n".data(using: .utf8)!)
}
func fail(_ message: String, _ code: Int32, _ extra: [String: Any] = [:]) -> Never {
  var value = extra; value["error"] = message; out(value); exit(code)
}

let args = CommandLine.arguments
guard args.count >= 3, let pid = pid_t(args[1]) else { fail("usage: ax_probe PID COMMAND [ARGS]", 64) }
let command = args[2]
let trustOptions = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: false] as CFDictionary
let trusted = AXIsProcessTrustedWithOptions(trustOptions)
if command == "trusted" { out(["ax_trusted": trusted]); exit(0) }
guard trusted else {
  fail("BLOCKED_ENV: the calling process is not trusted for Accessibility (System Settings > Privacy & Security > Accessibility > enable the terminal/app that runs this tool)", 3)
}

let app = AXUIElementCreateApplication(pid)
AXUIElementSetMessagingTimeout(app, 3.0)

func attr(_ element: AXUIElement, _ name: String) -> AnyObject? {
  var value: AnyObject?
  return AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success ? value : nil
}
func string(_ element: AXUIElement, _ name: String) -> String? {
  guard let value = attr(element, name) else { return nil }
  if let text = value as? String { return text }
  if let number = value as? NSNumber { return number.stringValue }
  return nil
}
func children(_ element: AXUIElement) -> [AXUIElement] { (attr(element, kAXChildrenAttribute) as? [AXUIElement]) ?? [] }
func frame(_ element: AXUIElement) -> [Double]? {
  guard let p = attr(element, kAXPositionAttribute), let s = attr(element, kAXSizeAttribute) else { return nil }
  var point = CGPoint.zero, size = CGSize.zero
  guard AXValueGetValue(p as! AXValue, .cgPoint, &point), AXValueGetValue(s as! AXValue, .cgSize, &size) else { return nil }
  return [Double(point.x), Double(point.y), Double(size.width), Double(size.height)].map { ($0 * 10).rounded() / 10 }
}
func describe(_ element: AXUIElement, withFrame: Bool = false) -> [String: Any] {
  var item: [String: Any] = [:]
  for (key, name) in [("role", kAXRoleAttribute), ("subrole", kAXSubroleAttribute), ("title", kAXTitleAttribute),
                      ("description", kAXDescriptionAttribute), ("roledescription", kAXRoleDescriptionAttribute),
                      ("placeholder", "AXPlaceholderValue"), ("url", "AXURL")] {
    if let text = string(element, name), !text.isEmpty { item[key] = text }
  }
  if let url = attr(element, "AXURL") as? URL { item["url"] = url.absoluteString }
  if let value = attr(element, kAXValueAttribute) {
    if let text = value as? String { item["value"] = text }
    else if let number = value as? NSNumber { item["value"] = number }
  } else { item["value_absent"] = true }
  if let level = attr(element, "AXDisclosureLevel") as? NSNumber { item["level"] = level }
  if let focused = attr(element, kAXFocusedAttribute) as? Bool, focused { item["focused"] = true }
  var names: CFArray?
  if AXUIElementCopyActionNames(element, &names) == .success, let list = names as? [String], !list.isEmpty { item["actions"] = list }
  if withFrame, let f = frame(element) { item["frame"] = f }
  return item
}
func text(_ element: AXUIElement) -> String {
  [kAXTitleAttribute, kAXDescriptionAttribute, "AXPlaceholderValue"].compactMap { string(element, $0) }.joined(separator: " | ")
}

// The front AxioSozo window's Chromium canvas: an AXGroup labelled "… (Chromium)" or
// "Chromium page" (ChromiumAccessibility.attach / setTitle).
func findCanvas() -> AXUIElement? {
  let windows = (attr(app, kAXWindowsAttribute) as? [AXUIElement]) ?? []
  let main = attr(app, kAXMainWindowAttribute).map { $0 as! AXUIElement }
  var queue: [(AXUIElement, Int)] = (main.map { [$0] } ?? windows).map { ($0, 0) }
  var visited = 0
  while !queue.isEmpty && visited < 30000 {
    let (element, depth) = queue.removeFirst(); visited += 1
    let label = text(element)
    if string(element, kAXRoleAttribute) == kAXGroupRole && (label.hasSuffix("(Chromium)") || label == "Chromium page") { return element }
    // Do not descend into a found canvas's foreign subtree here (that would request it).
    if depth < 60 { queue += children(element).map { ($0, depth + 1) } }
  }
  return nil
}
func subtree(_ element: AXUIElement, depth: Int, budget: inout Int) -> [String: Any] {
  var item = describe(element, withFrame: depth <= 2)
  budget -= 1
  if depth < 40 && budget > 0 {
    let kids = children(element)
    if !kids.isEmpty {
      var list: [[String: Any]] = []
      for kid in kids where budget > 0 { list.append(subtree(kid, depth: depth + 1, budget: &budget)) }
      item["children"] = list
    }
  }
  return item
}
func descendants(_ root: AXUIElement, limit: Int = 5000) -> [AXUIElement] {
  var result: [AXUIElement] = [], queue = [root]
  while !queue.isEmpty && result.count < limit { let e = queue.removeFirst(); result.append(e); queue += children(e) }
  return result
}
func webArea(_ canvas: AXUIElement) -> AXUIElement? { children(canvas).first { string($0, kAXRoleAttribute) == "AXWebArea" } }
func requireWebArea(seconds: Double) -> (AXUIElement, AXUIElement, Double) {
  let start = Date()
  guard let canvas = findCanvas() else { fail("no Chromium canvas group in the front window", 2) }
  while Date().timeIntervalSince(start) < seconds {
    if let area = webArea(canvas), children(area).count > 0 { return (canvas, area, Date().timeIntervalSince(start)) }
    Thread.sleep(forTimeInterval: 0.2)
  }
  fail("Chromium web area did not appear", 2, ["canvas": describe(canvas, withFrame: true), "children": children(canvas).map { describe($0) }])
}
func setEnhanced(_ on: Bool) -> AXError { AXUIElementSetAttributeValue(app, "AXEnhancedUserInterface" as CFString, on as CFBoolean) }

switch command {
case "activate":
  out(["command": command, "AXEnhancedUserInterface": true, "result": setEnhanced(true).rawValue])
case "deactivate":
  out(["command": command, "AXEnhancedUserInterface": false, "result": setEnhanced(false).rawValue])
case "dump":
  let seconds = args.count > 3 ? Double(args[3]) ?? 15 : 15
  let (canvas, area, waited) = requireWebArea(seconds: seconds)
  var budget = 3000
  out(["command": command, "seconds_until_tree": (waited * 1000).rounded() / 1000, "canvas": describe(canvas, withFrame: true),
       "web_area": subtree(area, depth: 0, budget: &budget), "truncated": budget <= 0])
case "press", "setvalue", "find":
  let (_, area, _) = requireWebArea(seconds: 15)
  let role = command == "press" ? kAXButtonRole as String : args[3]
  let needle = command == "press" ? args[3] : args[4]
  // `find` also matches AXValue (static text carries its text there).
  let matches: (AXUIElement) -> Bool = { element in
    string(element, kAXRoleAttribute) == role && (text(element).contains(needle) || (command == "find" && (string(element, kAXValueAttribute) ?? "").contains(needle)))
  }
  guard let element = descendants(area).first(where: matches) else {
    fail("element not found", 2, ["role": role, "text": needle])
  }
  if command == "press" {
    out(["command": command, "element": describe(element, withFrame: true), "result": AXUIElementPerformAction(element, kAXPressAction as CFString).rawValue])
  } else if command == "setvalue" {
    var settable = DarwinBoolean(false)
    AXUIElementIsAttributeSettable(element, kAXValueAttribute as CFString, &settable)
    let result = AXUIElementSetAttributeValue(element, kAXValueAttribute as CFString, args[5] as CFString)
    out(["command": command, "element": describe(element, withFrame: true), "settable": settable.boolValue, "result": result.rawValue])
  } else {
    out(["command": command, "element": describe(element, withFrame: true)])
  }
default:
  fail("unknown command", 64)
}
