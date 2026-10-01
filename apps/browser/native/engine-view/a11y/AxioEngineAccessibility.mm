/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Chromium accessibility as native NSAccessibility elements.
//
// Chrome JS (ChromiumAccessibility.sys.mjs) feeds one JSON patch per committed
// host batch. Each attached engine view (a chrome <canvas>) owns an element
// table. The accessible/mac hook in mozAccessible.mm (SetAxioForeignAXProvider,
// docs/design/engine-accessibility.md §8.2) appends the table's web-area root to
// the canvas accessible's children, forwards hit tests over the canvas and
// returns the focused element while the canvas (or its IME proxy) has DOM focus.
//
// Elements implement the informal NSAccessibility protocol like Gecko's own
// MOXAccessibleBase and cefclient's OSR bridge (osr_accessibility_node_mac.mm,
// BSD, CEF 062ebe4): roles, names, values, states, frames, actions, text-field
// ranges and search predicates (VoiceOver rotor and quick navigation). Not
// implemented in v1: AXTextMarker ranges (character/word navigation across
// elements), tables' row/column attributes, math.
//
// Geometry: records carry Chromium's relative bounds (offset container, scroll,
// transform); frames resolve lazily like AXTree::RelativeToTreeBounds and map
// through the canvas accessible's own AXFrame, so zoom, window moves and
// split view need no updates. Gecko builds without ARC: retain/release below.

#include "AxioEngineAccessibility.h"

#import <AppKit/AppKit.h>

#include <cmath>

#include "mozilla/ClearOnShutdown.h"
#include "mozilla/Services.h"
#include "mozilla/StaticPtr.h"
#include "mozilla/a11y/Platform.h"
#include "mozilla/dom/Document.h"
#include "mozilla/dom/Element.h"
#include "nsContentUtils.h"
#include "nsGkAtoms.h"
#include "nsIObserverService.h"
#include "nsThreadUtils.h"
#include "nsXULAppAPI.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
#pragma clang diagnostic ignored "-Wdeprecated-implementations"

namespace mozilla::a11y {
// Must stay token-identical to the declaration the firefox-native.json hunk adds
// to accessible/mac/mozAccessible.mm (design doc §8.2).
struct AxioForeignAXProvider {
  NSArray* (*children)(id aOwner, nsIContent* aContent);
  id (*hitTest)(id aOwner, nsIContent* aContent, NSPoint aPoint);
  id (*focused)(id aOwner, mozilla::dom::Document* aDocument);
};
void SetAxioForeignAXProvider(const AxioForeignAXProvider* aProvider);
}  // namespace mozilla::a11y

namespace {
constexpr size_t kMaxTargets = 32;
constexpr size_t kMaxElements = 25000;  // ChromiumAXTree / host MaxNodes
constexpr int kMaxDepth = 4096;
mozilla::StaticRefPtr<axio::EngineAccessibility> sInstance;

// Defensive JSON readers: chrome JS is trusted, but a malformed patch must
// never crash an AppKit accessibility callback.
NSString* Str(NSDictionary* aRecord, NSString* aKey) {
  id value = aRecord[aKey];
  return [value isKindOfClass:[NSString class]] ? value : nil;
}
NSNumber* Num(NSDictionary* aRecord, NSString* aKey) {
  id value = aRecord[aKey];
  return [value isKindOfClass:[NSNumber class]] ? value : nil;
}
NSArray* Arr(NSDictionary* aRecord, NSString* aKey) {
  id value = aRecord[aKey];
  return [value isKindOfClass:[NSArray class]] ? value : nil;
}
BOOL Flag(NSDictionary* aRecord, NSString* aKey) { return [Num(aRecord, aKey) boolValue]; }
double At(NSArray* aArray, NSUInteger aIndex) {
  if (aIndex >= aArray.count || ![aArray[aIndex] isKindOfClass:[NSNumber class]]) return 0;
  double value = [aArray[aIndex] doubleValue];
  return std::isfinite(value) ? value : 0;
}
uint32_t WireId(id aValue) {
  if (![aValue isKindOfClass:[NSNumber class]]) return 0;
  double value = [aValue doubleValue];
  return value >= 1 && value <= 4294967295.0 && std::floor(value) == value ? uint32_t(value) : 0;
}
}  // namespace

@class AxioEngineAXTable;

@interface AxioEngineAXElement : NSObject {
 @public
  AxioEngineAXTable* mTable;  // unretained; nil once detached
  uint32_t mId;
  uint32_t mParent;  // exposed parent id; 0 = the canvas (root) or unknown
  NSDictionary* mRecord;
}
- (instancetype)initWithTable:(AxioEngineAXTable*)aTable nodeId:(uint32_t)aId;
- (void)setRecord:(NSDictionary*)aRecord;
- (void)detach;
- (BOOL)exposed;
- (NSRect)contentRect;
- (NSRect)screenFrame;
- (NSArray*)exposedChildren;
@end

@interface AxioEngineAXTable : NSObject {
 @public
  uint64_t mTarget;
  NSMutableDictionary* mElements;  // NSNumber -> AxioEngineAXElement
  uint32_t mRoot;
  uint32_t mFocus;
  double mPx;
  double mCssWidth;  // canvas CSS width; 0 = unknown (zoom factor 1)
  id mOwner;         // retained: the canvas' native accessible (mozAccessible)
}
- (instancetype)initWithTarget:(uint64_t)aTarget;
- (void)setOwner:(id)aOwner;
- (AxioEngineAXElement*)element:(uint32_t)aId;
- (AxioEngineAXElement*)rootElement;
- (AxioEngineAXElement*)focusedElement;
- (void)applyPatch:(NSDictionary*)aPatch;
- (void)clear;
- (id)hitTest:(NSPoint)aPoint;
- (NSRect)ownerFrame;
- (void)action:(NSString*)aAction node:(uint32_t)aId value:(NSString*)aValue;
- (BOOL)contentFocused;
@end

// ---------------------------------------------------------------------------
@implementation AxioEngineAXElement

- (instancetype)initWithTable:(AxioEngineAXTable*)aTable nodeId:(uint32_t)aId {
  if ((self = [super init])) {
    mTable = aTable;
    mId = aId;
  }
  return self;
}

- (void)dealloc {
  [mRecord release];
  [super dealloc];
}

- (void)setRecord:(NSDictionary*)aRecord {
  if (aRecord == mRecord) return;
  [mRecord release];
  mRecord = [aRecord retain];
}

- (void)detach {
  mTable = nil;
}

- (BOOL)isEqual:(id)aOther {
  return self == aOther;  // one wrapper per node; detached wrappers stay distinct
}
- (NSUInteger)hash {
  return (NSUInteger)self;
}

- (BOOL)exposed {
  return mTable && Flag(mRecord, @"x");
}

// Gecko's MOXAccessibleBase calls these on objects it finds in child arrays.
- (BOOL)hasRepresentedView {
  return NO;
}
- (id)representedView {
  return nil;
}
- (BOOL)isAccessibilityElement {
  return [self exposed];
}
- (BOOL)accessibilityIsIgnored {
  return ![self exposed];
}
- (BOOL)accessibilityNotifiesWhenDestroyed {
  return YES;
}

// ---- geometry -------------------------------------------------------------
// Chromium AXTree::RelativeToTreeBounds over the records (see ChromiumAXTree.resolveBounds).
- (NSRect)contentRect {
  if (!mTable) return NSZeroRect;
  AxioEngineAXElement* node = self;
  NSArray* b = Arr(mRecord, @"b");
  double x = At(b, 0), y = At(b, 1), w = At(b, 2), h = At(b, 3);
  for (int depth = 0; node && depth < kMaxDepth; depth++) {
    NSArray* tf = Arr(node->mRecord, @"tf");
    if (tf.count == 6) {
      double m[6];
      for (int i = 0; i < 6; i++) m[i] = At(tf, i);
      double xs[4] = {x, x + w, x, x + w}, ys[4] = {y, y, y + h, y + h};
      double minX = INFINITY, minY = INFINITY, maxX = -INFINITY, maxY = -INFINITY;
      for (int i = 0; i < 4; i++) {
        double px = m[0] * xs[i] + m[2] * ys[i] + m[4], py = m[1] * xs[i] + m[3] * ys[i] + m[5];
        minX = std::min(minX, px); maxX = std::max(maxX, px);
        minY = std::min(minY, py); maxY = std::max(maxY, py);
      }
      x = minX; y = minY; w = maxX - minX; h = maxY - minY;
    }
    AxioEngineAXElement* container = [mTable element:WireId(node->mRecord[@"oc"])];
    if (!container || container == node) break;
    NSArray* cb = Arr(container->mRecord, @"b");
    x += At(cb, 0);
    y += At(cb, 1);
    if (NSArray* scroll = Arr(container->mRecord, @"scroll"); scroll.count == 2) {
      x -= At(scroll, 0);
      y -= At(scroll, 1);
    }
    node = container;
  }
  double px = mTable->mPx > 0 ? mTable->mPx : 1;
  return NSMakeRect(x / px, y / px, w / px, h / px);  // view points, top-left origin
}

// Cocoa screen coordinates (bottom-left origin), via the canvas accessible's
// own AXFrame (Gecko flips with the main screen height, as VoiceOver expects).
- (NSRect)screenFrame {
  if (!mTable) return NSZeroRect;
  NSRect canvas = [mTable ownerFrame];
  if (NSIsEmptyRect(canvas)) return NSZeroRect;
  NSRect content = [self contentRect];
  double zoom = mTable->mCssWidth > 0 ? canvas.size.width / mTable->mCssWidth : 1;
  return NSMakeRect(canvas.origin.x + content.origin.x * zoom,
                    canvas.origin.y + canvas.size.height - (content.origin.y + content.size.height) * zoom,
                    content.size.width * zoom, content.size.height * zoom);
}

- (NSArray*)exposedChildren {
  NSMutableArray* kids = [NSMutableArray array];
  if (![self exposed]) return kids;
  for (id kid in Arr(mRecord, @"kids")) {
    AxioEngineAXElement* child = [mTable element:WireId(kid)];
    if ([child exposed]) [kids addObject:child];
  }
  return kids;
}

- (id)parentObject {
  if (!mTable) return nil;
  if (mId == mTable->mRoot) return mTable->mOwner;
  AxioEngineAXElement* parent = [mTable element:mParent];
  return [parent exposed] ? parent : (id)[mTable rootElement];
}

// ---- text helpers -----------------------------------------------------------
- (NSString*)role {
  NSString* role = Str(mRecord, @"role");
  return [role hasPrefix:@"AX"] && role.length <= 40 ? role : NSAccessibilityGroupRole;
}
- (NSString*)subrole {
  NSString* subrole = Str(mRecord, @"subrole");
  return [subrole hasPrefix:@"AX"] && subrole.length <= 40 ? subrole : nil;
}
- (BOOL)isTextRole {
  NSString* role = [self role];
  return [role isEqualToString:NSAccessibilityTextFieldRole] || [role isEqualToString:NSAccessibilityTextAreaRole] ||
         [role isEqualToString:NSAccessibilityComboBoxRole] || [role isEqualToString:NSAccessibilityStaticTextRole];
}
- (NSString*)text {
  id value = mRecord[@"value"];
  return [value isKindOfClass:[NSString class]] && !Flag(mRecord, @"protected") ? value : @"";
}
- (NSRange)clamp:(NSRange)aRange {
  NSUInteger length = [self text].length;
  NSUInteger location = std::min<NSUInteger>(aRange.location, length);
  return NSMakeRange(location, std::min<NSUInteger>(aRange.length, length - location));
}
- (NSRange)selectedRange {
  NSArray* sel = Arr(mRecord, @"sel");
  if (sel.count != 2) return NSMakeRange([self text].length, 0);
  NSUInteger a = NSUInteger(std::max(0.0, At(sel, 0))), b = NSUInteger(std::max(0.0, At(sel, 1)));
  return [self clamp:NSMakeRange(std::min(a, b), a > b ? a - b : b - a)];
}
- (NSUInteger)lineForIndex:(NSUInteger)aIndex {
  NSString* text = [self text];
  NSUInteger line = 0;
  for (NSUInteger i = 0; i < std::min(aIndex, text.length); i++)
    if ([text characterAtIndex:i] == '\n') line++;
  return line;
}
- (NSRange)rangeForLine:(NSUInteger)aLine {
  NSString* text = [self text];
  NSUInteger start = 0, line = 0;
  for (NSUInteger i = 0; i <= text.length; i++) {
    if (i == text.length || [text characterAtIndex:i] == '\n') {
      if (line == aLine) return NSMakeRange(start, i - start);
      line++;
      start = i + 1;
    }
  }
  return NSMakeRange(text.length, 0);
}

// ---- informal NSAccessibility protocol -------------------------------------
- (NSArray*)accessibilityAttributeNames {
  if (![self exposed]) return @[];
  NSMutableArray* names = [NSMutableArray arrayWithArray:@[
    NSAccessibilityRoleAttribute, NSAccessibilitySubroleAttribute, NSAccessibilityRoleDescriptionAttribute,
    NSAccessibilityChildrenAttribute, @"AXChildrenInNavigationOrder", NSAccessibilityParentAttribute,
    NSAccessibilityWindowAttribute, NSAccessibilityTopLevelUIElementAttribute, NSAccessibilityPositionAttribute,
    NSAccessibilitySizeAttribute, @"AXFrame", NSAccessibilityTitleAttribute, NSAccessibilityDescriptionAttribute,
    NSAccessibilityValueAttribute, NSAccessibilityHelpAttribute, NSAccessibilityEnabledAttribute,
    NSAccessibilityFocusedAttribute, NSAccessibilityPlaceholderValueAttribute, @"AXRequired", @"AXInvalid",
    @"AXElementBusy", @"AXARIALive", NSAccessibilityExpandedAttribute, NSAccessibilitySelectedAttribute,
    NSAccessibilityURLAttribute, @"AXVisited", NSAccessibilityLinkedUIElementsAttribute, @"AXARIASetSize",
    @"AXARIAPosInSet", NSAccessibilityMinValueAttribute, NSAccessibilityMaxValueAttribute]];
  if ([self isTextRole]) {
    [names addObjectsFromArray:@[NSAccessibilityNumberOfCharactersAttribute, NSAccessibilitySelectedTextAttribute,
      NSAccessibilitySelectedTextRangeAttribute, NSAccessibilityVisibleCharacterRangeAttribute,
      NSAccessibilityInsertionPointLineNumberAttribute]];
  }
  if (mTable && mId == mTable->mRoot) [names addObject:@"AXLoaded"];
  return names;
}

- (id)accessibilityAttributeValue:(NSString*)aAttribute {
  if (!mTable) return nil;
  NSString* role = [self role];
  if ([aAttribute isEqualToString:NSAccessibilityRoleAttribute]) return role;
  if ([aAttribute isEqualToString:NSAccessibilitySubroleAttribute]) return [self subrole];
  if ([aAttribute isEqualToString:NSAccessibilityRoleDescriptionAttribute]) {
    NSString* custom = Str(mRecord, @"roledesc");
    return custom.length ? custom : NSAccessibilityRoleDescription(role, [self subrole]);
  }
  if ([aAttribute isEqualToString:NSAccessibilityChildrenAttribute] ||
      [aAttribute isEqualToString:@"AXChildrenInNavigationOrder"]) {
    return [self exposedChildren];
  }
  if ([aAttribute isEqualToString:NSAccessibilityParentAttribute]) return [self parentObject];
  if ([aAttribute isEqualToString:NSAccessibilityWindowAttribute] ||
      [aAttribute isEqualToString:NSAccessibilityTopLevelUIElementAttribute]) {
    return [mTable->mOwner accessibilityAttributeValue:aAttribute];
  }
  if ([aAttribute isEqualToString:NSAccessibilityPositionAttribute]) {
    return [NSValue valueWithPoint:[self screenFrame].origin];
  }
  if ([aAttribute isEqualToString:NSAccessibilitySizeAttribute]) {
    return [NSValue valueWithSize:[self screenFrame].size];
  }
  if ([aAttribute isEqualToString:@"AXFrame"]) return [NSValue valueWithRect:[self screenFrame]];
  if ([aAttribute isEqualToString:NSAccessibilityTitleAttribute]) return Str(mRecord, @"title") ?: @"";
  if ([aAttribute isEqualToString:NSAccessibilityDescriptionAttribute]) return Str(mRecord, @"label") ?: @"";
  if ([aAttribute isEqualToString:NSAccessibilityHelpAttribute]) return Str(mRecord, @"help") ?: @"";
  if ([aAttribute isEqualToString:NSAccessibilityPlaceholderValueAttribute]) return Str(mRecord, @"placeholder");
  if ([aAttribute isEqualToString:NSAccessibilityValueAttribute]) {
    id value = mRecord[@"value"];
    if (Flag(mRecord, @"protected")) return @"";
    return [value isKindOfClass:[NSString class]] || [value isKindOfClass:[NSNumber class]] ? value : nil;
  }
  if ([aAttribute isEqualToString:NSAccessibilityEnabledAttribute]) return @(Flag(mRecord, @"enabled"));
  if ([aAttribute isEqualToString:NSAccessibilityFocusedAttribute]) {
    return @(mId == mTable->mFocus && [mTable contentFocused]);
  }
  if ([aAttribute isEqualToString:@"AXRequired"]) return @(Flag(mRecord, @"required"));
  if ([aAttribute isEqualToString:@"AXInvalid"]) return Str(mRecord, @"invalid") ?: @"false";
  if ([aAttribute isEqualToString:@"AXElementBusy"]) return @(Flag(mRecord, @"busy"));
  if ([aAttribute isEqualToString:@"AXARIALive"]) return Str(mRecord, @"live");
  if ([aAttribute isEqualToString:NSAccessibilityExpandedAttribute]) return Num(mRecord, @"expanded");
  if ([aAttribute isEqualToString:NSAccessibilitySelectedAttribute]) return Num(mRecord, @"selected");
  if ([aAttribute isEqualToString:@"AXVisited"]) return @(Flag(mRecord, @"visited"));
  if ([aAttribute isEqualToString:@"AXARIASetSize"]) return Num(mRecord, @"setsize");
  if ([aAttribute isEqualToString:@"AXARIAPosInSet"]) return Num(mRecord, @"posinset");
  if ([aAttribute isEqualToString:NSAccessibilityURLAttribute]) {
    NSString* url = Str(mRecord, @"url");
    return url ? [NSURL URLWithString:url] : nil;
  }
  if ([aAttribute isEqualToString:NSAccessibilityLinkedUIElementsAttribute]) {
    AxioEngineAXElement* target = [mTable element:WireId(mRecord[@"linktarget"])];
    return [target exposed] ? @[target] : @[];
  }
  if ([aAttribute isEqualToString:NSAccessibilityMinValueAttribute] ||
      [aAttribute isEqualToString:NSAccessibilityMaxValueAttribute]) {
    NSArray* range = Arr(mRecord, @"range");
    NSUInteger index = [aAttribute isEqualToString:NSAccessibilityMinValueAttribute] ? 0 : 1;
    return range.count == 4 && [range[index] isKindOfClass:[NSNumber class]] ? range[index] : nil;
  }
  if ([aAttribute isEqualToString:@"AXLoaded"]) return @YES;
  if ([self isTextRole]) {
    NSString* text = [self text];
    if ([aAttribute isEqualToString:NSAccessibilityNumberOfCharactersAttribute]) return @(text.length);
    if ([aAttribute isEqualToString:NSAccessibilitySelectedTextRangeAttribute]) {
      return [NSValue valueWithRange:[self selectedRange]];
    }
    if ([aAttribute isEqualToString:NSAccessibilitySelectedTextAttribute]) {
      return [text substringWithRange:[self selectedRange]];
    }
    if ([aAttribute isEqualToString:NSAccessibilityVisibleCharacterRangeAttribute]) {
      return [NSValue valueWithRange:NSMakeRange(0, text.length)];
    }
    if ([aAttribute isEqualToString:NSAccessibilityInsertionPointLineNumberAttribute]) {
      return @([self lineForIndex:NSMaxRange([self selectedRange])]);
    }
  }
  return nil;
}

- (BOOL)accessibilityIsAttributeSettable:(NSString*)aAttribute {
  NSDictionary* settable = [mRecord[@"settable"] isKindOfClass:[NSDictionary class]] ? mRecord[@"settable"] : nil;
  if ([aAttribute isEqualToString:NSAccessibilityFocusedAttribute]) return [settable[@"focused"] boolValue];
  if ([aAttribute isEqualToString:NSAccessibilityValueAttribute]) return [settable[@"value"] boolValue];
  return NO;
}

- (void)accessibilitySetValue:(id)aValue forAttribute:(NSString*)aAttribute {
  if (!mTable || ![self accessibilityIsAttributeSettable:aAttribute]) return;
  if ([aAttribute isEqualToString:NSAccessibilityFocusedAttribute] && [aValue boolValue]) {
    [mTable action:@"focus" node:mId value:@""];
  } else if ([aAttribute isEqualToString:NSAccessibilityValueAttribute] && [aValue isKindOfClass:[NSString class]]) {
    [mTable action:@"set_value" node:mId value:aValue];
  }
}

- (NSArray*)accessibilityParameterizedAttributeNames {
  if (![self exposed]) return @[];
  NSMutableArray* names = [NSMutableArray arrayWithArray:@[@"AXUIElementsForSearchPredicate",
                                                            @"AXUIElementCountForSearchPredicate"]];
  if ([self isTextRole]) {
    [names addObjectsFromArray:@[NSAccessibilityStringForRangeParameterizedAttribute,
      NSAccessibilityAttributedStringForRangeParameterizedAttribute, NSAccessibilityLineForIndexParameterizedAttribute,
      NSAccessibilityRangeForLineParameterizedAttribute, NSAccessibilityBoundsForRangeParameterizedAttribute]];
  }
  return names;
}

- (id)accessibilityAttributeValue:(NSString*)aAttribute forParameter:(id)aParameter {
  if (!mTable) return nil;
  if ([aAttribute isEqualToString:@"AXUIElementsForSearchPredicate"] ||
      [aAttribute isEqualToString:@"AXUIElementCountForSearchPredicate"]) {
    if (![aParameter isKindOfClass:[NSDictionary class]]) return nil;
    NSArray* found = [self search:aParameter];
    return [aAttribute isEqualToString:@"AXUIElementCountForSearchPredicate"] ? @(found.count) : found;
  }
  if (![self isTextRole]) return nil;
  NSString* text = [self text];
  if ([aAttribute isEqualToString:NSAccessibilityLineForIndexParameterizedAttribute]) {
    return @([self lineForIndex:[aParameter unsignedIntegerValue]]);
  }
  if ([aAttribute isEqualToString:NSAccessibilityRangeForLineParameterizedAttribute]) {
    return [NSValue valueWithRange:[self rangeForLine:[aParameter unsignedIntegerValue]]];
  }
  if (![aParameter isKindOfClass:[NSValue class]]) return nil;
  NSRange range = [self clamp:[aParameter rangeValue]];
  if ([aAttribute isEqualToString:NSAccessibilityStringForRangeParameterizedAttribute]) {
    return [text substringWithRange:range];
  }
  if ([aAttribute isEqualToString:NSAccessibilityAttributedStringForRangeParameterizedAttribute]) {
    return [[[NSAttributedString alloc] initWithString:[text substringWithRange:range]] autorelease];
  }
  if ([aAttribute isEqualToString:NSAccessibilityBoundsForRangeParameterizedAttribute]) {
    return [NSValue valueWithRect:[self screenFrame]];  // whole element: no glyph geometry in v1
  }
  return nil;
}

// AXUIElementsForSearchPredicate: the subset VoiceOver's rotor and quick
// navigation use. Preorder over exposed elements below the web area.
static BOOL MatchesKey(AxioEngineAXElement* aElement, NSString* aKey, AxioEngineAXElement* aStart) {
  NSString* role = [aElement role];
  NSString* subrole = [aElement subrole];
  NSDictionary* r = aElement->mRecord;
  if ([aKey isEqualToString:@"AXAnyTypeSearchKey"]) return YES;
  if ([aKey isEqualToString:@"AXHeadingSearchKey"]) return [role isEqualToString:@"AXHeading"];
  if ([aKey hasPrefix:@"AXHeadingLevel"] && [aKey hasSuffix:@"SearchKey"]) {
    NSInteger level = [[aKey substringWithRange:NSMakeRange(14, 1)] integerValue];
    return [role isEqualToString:@"AXHeading"] && [Num(r, @"level") integerValue] == level;
  }
  if ([aKey isEqualToString:@"AXLinkSearchKey"]) return [role isEqualToString:NSAccessibilityLinkRole];
  if ([aKey isEqualToString:@"AXVisitedLinkSearchKey"]) return [role isEqualToString:NSAccessibilityLinkRole] && Flag(r, @"visited");
  if ([aKey isEqualToString:@"AXUnvisitedLinkSearchKey"]) return [role isEqualToString:NSAccessibilityLinkRole] && !Flag(r, @"visited");
  if ([aKey isEqualToString:@"AXButtonSearchKey"]) return [role isEqualToString:NSAccessibilityButtonRole] || [role isEqualToString:NSAccessibilityPopUpButtonRole];
  if ([aKey isEqualToString:@"AXCheckBoxSearchKey"]) return [role isEqualToString:NSAccessibilityCheckBoxRole];
  if ([aKey isEqualToString:@"AXRadioGroupSearchKey"]) return [role isEqualToString:NSAccessibilityRadioGroupRole];
  if ([aKey isEqualToString:@"AXTextFieldSearchKey"]) {
    return [role isEqualToString:NSAccessibilityTextFieldRole] || [role isEqualToString:NSAccessibilityTextAreaRole] || [role isEqualToString:NSAccessibilityComboBoxRole];
  }
  if ([aKey isEqualToString:@"AXControlSearchKey"]) {
    static NSSet* controls = [[NSSet alloc] initWithArray:@[NSAccessibilityButtonRole, NSAccessibilityPopUpButtonRole,
      NSAccessibilityCheckBoxRole, NSAccessibilityRadioButtonRole, NSAccessibilityTextFieldRole, NSAccessibilityTextAreaRole,
      NSAccessibilityComboBoxRole, NSAccessibilitySliderRole, NSAccessibilityIncrementorRole, NSAccessibilityDisclosureTriangleRole]];
    return [controls containsObject:role];
  }
  if ([aKey isEqualToString:@"AXLandmarkSearchKey"]) return [subrole hasPrefix:@"AXLandmark"];
  if ([aKey isEqualToString:@"AXArticleSearchKey"]) return [subrole isEqualToString:@"AXDocumentArticle"];
  if ([aKey isEqualToString:@"AXTableSearchKey"]) return [role isEqualToString:NSAccessibilityTableRole];
  if ([aKey isEqualToString:@"AXListSearchKey"]) return [role isEqualToString:NSAccessibilityListRole];
  if ([aKey isEqualToString:@"AXGraphicSearchKey"]) return [role isEqualToString:NSAccessibilityImageRole];
  if ([aKey isEqualToString:@"AXStaticTextSearchKey"]) return [role isEqualToString:NSAccessibilityStaticTextRole];
  if ([aKey isEqualToString:@"AXKeyboardFocusableSearchKey"]) return Flag(r, @"focusable");
  if ([aKey isEqualToString:@"AXLiveRegionSearchKey"]) return Str(r, @"live").length > 0 && ![Str(r, @"live") isEqualToString:@"off"];
  if ([aKey isEqualToString:@"AXSameTypeSearchKey"]) return aStart && [role isEqualToString:[aStart role]];
  return NO;  // unsupported keys match nothing rather than everything
}

- (void)collect:(NSMutableArray*)aOut depth:(int)aDepth {
  if (aDepth > kMaxDepth || aOut.count > kMaxElements) return;
  for (AxioEngineAXElement* child in [self exposedChildren]) {
    [aOut addObject:child];
    [child collect:aOut depth:aDepth + 1];
  }
}

- (NSArray*)search:(NSDictionary*)aPredicate {
  id keys = aPredicate[@"AXSearchKey"];
  NSArray* keyList = [keys isKindOfClass:[NSArray class]] ? keys : ([keys isKindOfClass:[NSString class]] ? @[keys] : @[@"AXAnyTypeSearchKey"]);
  id start = aPredicate[@"AXStartElement"];
  AxioEngineAXElement* startElement = [start isKindOfClass:[AxioEngineAXElement class]] ? start : nil;
  BOOL previous = [aPredicate[@"AXDirection"] isEqual:@"AXDirectionPrevious"];
  NSInteger limit = [aPredicate[@"AXResultsLimit"] isKindOfClass:[NSNumber class]] ? [aPredicate[@"AXResultsLimit"] integerValue] : -1;
  NSString* needle = [aPredicate[@"AXSearchText"] isKindOfClass:[NSString class]] ? aPredicate[@"AXSearchText"] : nil;
  BOOL immediate = [aPredicate[@"AXImmediateDescendantsOnly"] boolValue];
  NSMutableArray* all = [NSMutableArray array];
  if (immediate) [all addObjectsFromArray:[self exposedChildren]];
  else [self collect:all depth:0];
  NSInteger from = startElement ? NSInteger([all indexOfObjectIdenticalTo:startElement]) : NSNotFound;
  NSInteger index = from == NSNotFound ? (previous ? NSInteger(all.count) - 1 : 0) : (previous ? from - 1 : from + 1);
  NSMutableArray* found = [NSMutableArray array];
  for (; index >= 0 && index < NSInteger(all.count); index += previous ? -1 : 1) {
    AxioEngineAXElement* element = all[NSUInteger(index)];
    BOOL matches = NO;
    for (id key in keyList)
      if ([key isKindOfClass:[NSString class]] && MatchesKey(element, key, startElement)) { matches = YES; break; }
    if (!matches) continue;
    if (needle.length) {
      NSString* haystack = [NSString stringWithFormat:@"%@ %@ %@", Str(element->mRecord, @"title") ?: @"",
                                                     Str(element->mRecord, @"label") ?: @"", [element text]];
      if ([haystack rangeOfString:needle options:NSCaseInsensitiveSearch].location == NSNotFound) continue;
    }
    [found addObject:element];
    if (limit > 0 && NSInteger(found.count) >= limit) break;
  }
  return found;
}

- (NSArray*)accessibilityActionNames {
  if (![self exposed]) return @[];
  NSMutableArray* names = [NSMutableArray array];
  for (id action in Arr(mRecord, @"actions"))
    if ([action isKindOfClass:[NSString class]] && [action hasPrefix:@"AX"]) [names addObject:action];
  return names;
}

- (NSString*)accessibilityActionDescription:(NSString*)aAction {
  return NSAccessibilityActionDescription(aAction);
}

- (void)accessibilityPerformAction:(NSString*)aAction {
  if (![self exposed] || ![[self accessibilityActionNames] containsObject:aAction]) return;
  static NSDictionary* map = [@{NSAccessibilityPressAction: @"press", NSAccessibilityShowMenuAction: @"show_menu",
    NSAccessibilityIncrementAction: @"increment", NSAccessibilityDecrementAction: @"decrement",
    @"AXScrollToVisible": @"scroll_to"} retain];
  if (NSString* action = map[aAction]) [mTable action:action node:mId value:@""];
}

- (id)accessibilityHitTest:(NSPoint)aPoint {
  return mTable ? [mTable hitTest:aPoint] : nil;
}

- (id)accessibilityFocusedUIElement {
  return mTable ? [mTable focusedElement] : nil;
}

@end

// ---------------------------------------------------------------------------
@implementation AxioEngineAXTable

- (instancetype)initWithTarget:(uint64_t)aTarget {
  if ((self = [super init])) {
    mTarget = aTarget;
    mElements = [[NSMutableDictionary alloc] init];
    mPx = 1;
  }
  return self;
}

- (void)dealloc {
  [self clear];
  [mElements release];
  [mOwner release];
  [super dealloc];
}

- (void)setOwner:(id)aOwner {
  if (aOwner == mOwner) return;
  [mOwner release];
  mOwner = [aOwner retain];
}

- (AxioEngineAXElement*)element:(uint32_t)aId {
  return aId ? mElements[@(aId)] : nil;
}
- (AxioEngineAXElement*)rootElement {
  AxioEngineAXElement* root = [self element:mRoot];
  return [root exposed] ? root : nil;
}
- (AxioEngineAXElement*)focusedElement {
  AxioEngineAXElement* focused = [self element:mFocus];
  return [focused exposed] ? focused : [self rootElement];
}

- (NSRect)ownerFrame {
  id frame = [mOwner accessibilityAttributeValue:@"AXFrame"];
  return [frame isKindOfClass:[NSValue class]] ? [frame rectValue] : NSZeroRect;
}

- (BOOL)contentFocused {
  return sInstance && sInstance->IsContentFocused(mTarget);
}

- (void)action:(NSString*)aAction node:(uint32_t)aId value:(NSString*)aValue {
  if (!sInstance) return;
  nsAutoString value;
  NSUInteger length = std::min<NSUInteger>(aValue.length, 4096);
  value.SetLength(length);
  [aValue getCharacters:reinterpret_cast<unichar*>(value.BeginWriting()) range:NSMakeRange(0, length)];
  sInstance->RequestAction(mTarget, aId, aAction.UTF8String, value);
}

- (void)remove:(AxioEngineAXElement*)aElement {
  [aElement retain];
  [mElements removeObjectForKey:@(aElement->mId)];
  [aElement detach];
  NSAccessibilityPostNotification(aElement, NSAccessibilityUIElementDestroyedNotification);
  [aElement release];
}

- (void)clear {
  for (AxioEngineAXElement* element in [mElements allValues]) [self remove:element];
  mRoot = 0;
  mFocus = 0;
}

- (void)post:(NSString*)aNotification on:(id)aObject {
  if (aObject) NSAccessibilityPostNotification(aObject, aNotification);
}

- (void)applyPatch:(NSDictionary*)aPatch {
  BOOL reset = Flag(aPatch, @"reset");
  uint32_t previousRoot = mRoot;
  if (reset) [self clear];
  if (NSNumber* px = Num(aPatch, @"px"); px && [px doubleValue] >= 1 && [px doubleValue] <= 4) mPx = [px doubleValue];
  if (NSDictionary* viewport = [aPatch[@"viewport"] isKindOfClass:[NSDictionary class]] ? aPatch[@"viewport"] : nil) {
    double css = [Num(viewport, @"cssWidth") doubleValue];
    mCssWidth = std::isfinite(css) && css > 0 ? css : 0;
  }
  NSArray* nodes = Arr(aPatch, @"nodes");
  for (id record in nodes) {
    if (![record isKindOfClass:[NSDictionary class]]) continue;
    uint32_t nodeId = WireId(record[@"id"]);
    if (!nodeId) continue;
    AxioEngineAXElement* element = [self element:nodeId];
    if (!element) {
      if (mElements.count >= kMaxElements) continue;
      element = [[[AxioEngineAXElement alloc] initWithTable:self nodeId:nodeId] autorelease];
      mElements[@(nodeId)] = element;
    }
    [element setRecord:record];
  }
  // Parents follow the exposed children lists of this patch (JS touched every
  // exposed ancestor whose flattened children changed).
  for (id record in nodes) {
    if (![record isKindOfClass:[NSDictionary class]] || !Flag(record, @"x")) continue;
    uint32_t parent = WireId(record[@"id"]);
    for (id kid in Arr(record, @"kids")) {
      if (AxioEngineAXElement* child = [self element:WireId(kid)]) child->mParent = parent;
    }
  }
  for (id removed in Arr(aPatch, @"removed")) {
    if (AxioEngineAXElement* element = [self element:WireId(removed)]) [self remove:element];
  }
  mRoot = WireId(aPatch[@"root"]);
  uint32_t focus = WireId(aPatch[@"focus"]);
  mFocus = focus;
  if (AxioEngineAXElement* root = [self element:mRoot]) root->mParent = 0;
  // The canvas' children change when the web area appears or is replaced.
  if (reset || previousRoot != mRoot) [self post:NSAccessibilityLayoutChangedNotification on:mOwner];
  BOOL focused = [self contentFocused];
  for (id item in Arr(aPatch, @"notifications")) {
    if (![item isKindOfClass:[NSDictionary class]]) continue;
    NSString* type = Str(item, @"type");
    AxioEngineAXElement* element = [self element:WireId(item[@"id"])];
    if ([type isEqualToString:@"announce"]) {
      NSString* text = Str(item, @"text");
      if (!text.length) continue;
      NSAccessibilityPriorityLevel priority =
          [Str(item, @"priority") isEqualToString:@"high"] ? NSAccessibilityPriorityHigh : NSAccessibilityPriorityMedium;
      id window = [NSApp mainWindow];
      if (window) {
        NSAccessibilityPostNotificationWithUserInfo(window, NSAccessibilityAnnouncementRequestedNotification,
            @{NSAccessibilityAnnouncementKey: [text substringToIndex:std::min<NSUInteger>(text.length, 500)],
              NSAccessibilityPriorityKey: @(priority)});
      }
      continue;
    }
    if (![element exposed]) continue;
    if ([type isEqualToString:@"focus"]) {
      if (focused) [self post:NSAccessibilityFocusedUIElementChangedNotification on:element];
    } else if ([type isEqualToString:@"value"]) {
      [self post:NSAccessibilityValueChangedNotification on:element];
    } else if ([type isEqualToString:@"title"]) {
      [self post:NSAccessibilityTitleChangedNotification on:element];
    } else if ([type isEqualToString:@"selectedText"]) {
      [self post:NSAccessibilitySelectedTextChangedNotification on:element];
    } else if ([type isEqualToString:@"expanded"]) {
      [self post:@"AXExpandedChanged" on:element];
    } else if ([type isEqualToString:@"layout"]) {
      [self post:NSAccessibilityLayoutChangedNotification on:element];
    } else if ([type isEqualToString:@"load"]) {
      [self post:@"AXLoadComplete" on:element];
    }
  }
}

// Cocoa screen point -> deepest exposed element whose frame contains it.
static AxioEngineAXElement* Deepest(AxioEngineAXElement* aElement, NSPoint aPoint, int aDepth) {
  if (aDepth > kMaxDepth) return nil;
  NSArray* kids = [aElement exposedChildren];
  for (NSInteger i = NSInteger(kids.count) - 1; i >= 0; i--) {
    if (AxioEngineAXElement* hit = Deepest(kids[NSUInteger(i)], aPoint, aDepth + 1)) return hit;
  }
  NSRect frame = [aElement screenFrame];
  BOOL inside = aPoint.x >= NSMinX(frame) && aPoint.x < NSMaxX(frame) && aPoint.y >= NSMinY(frame) && aPoint.y < NSMaxY(frame);
  return inside && frame.size.width > 0 && frame.size.height > 0 ? aElement : nil;
}

- (id)hitTest:(NSPoint)aPoint {
  AxioEngineAXElement* root = [self rootElement];
  if (!root) return nil;
  return Deepest(root, aPoint, 0) ?: root;
}

@end

#pragma clang diagnostic pop

// ---------------------------------------------------------------------------
namespace {

NSArray* ProviderChildren(id aOwner, nsIContent* aContent) {
  return sInstance ? static_cast<NSArray*>(sInstance->Children(aOwner, aContent)) : nil;
}
id ProviderHitTest(id aOwner, nsIContent* aContent, NSPoint aPoint) {
  return sInstance ? static_cast<id>(sInstance->HitTest(aOwner, aContent, aPoint.x, aPoint.y)) : nil;
}
id ProviderFocused(id, mozilla::dom::Document* aDocument) {
  return sInstance ? static_cast<id>(sInstance->Focused(aDocument)) : nil;
}
const mozilla::a11y::AxioForeignAXProvider sProvider = {ProviderChildren, ProviderHitTest, ProviderFocused};

AxioEngineAXTable* TableOf(void* aTable) { return static_cast<AxioEngineAXTable*>(aTable); }

// DOM focus on the engine view: the canvas, or one of the presenter's IME proxy
// editors (aria-hidden inputs beside it, CEFPresenter #createIME).
bool FocusIsOn(mozilla::dom::Element* aCanvas, nsIContent* aFocused) {
  if (!aCanvas || !aFocused) return false;
  if (aFocused == aCanvas) return true;
  return aFocused->GetParent() == aCanvas->GetParent() &&
         aFocused->IsAnyOfHTMLElements(nsGkAtoms::input, nsGkAtoms::textarea) && aFocused->IsElement() &&
         aFocused->AsElement()->AttrValueIs(kNameSpaceID_None, nsGkAtoms::aria_hidden, nsGkAtoms::_true, eCaseMatters);
}

}  // namespace

namespace axio {

NS_IMPL_ISUPPORTS(EngineAccessibility, nsIAxioEngineAccessibility, nsIObserver)

EngineAccessibility::EngineAccessibility() = default;
EngineAccessibility::~EngineAccessibility() { MOZ_ASSERT(mViews.IsEmpty()); }

/* static */
already_AddRefed<EngineAccessibility> EngineAccessibility::GetSingleton() {
  MOZ_RELEASE_ASSERT(NS_IsMainThread());
  MOZ_RELEASE_ASSERT(XRE_IsParentProcess());
  if (!sInstance) {
    sInstance = new EngineAccessibility();
    sInstance->Init();
    mozilla::ClearOnShutdown(&sInstance);
  }
  return do_AddRef(sInstance);
}

void EngineAccessibility::Init() {
  if (nsCOMPtr<nsIObserverService> obs = mozilla::services::GetObserverService()) {
    obs->AddObserver(this, "xpcom-will-shutdown", false);
  }
  mozilla::a11y::SetAxioForeignAXProvider(&sProvider);
}

void EngineAccessibility::ReleaseView(View& aView) {
  if (aView.mTable) {
    AxioEngineAXTable* table = TableOf(aView.mTable);
    [table clear];
    [table setOwner:nil];
    [table release];
    aView.mTable = nullptr;
  }
  aView.mCanvas = nullptr;
}

void EngineAccessibility::Shutdown() {
  if (mShutdown) return;
  mShutdown = true;
  mozilla::a11y::SetAxioForeignAXProvider(nullptr);
  for (auto& view : mViews) ReleaseView(view);
  mViews.Clear();
  mListener = nullptr;
  if (nsCOMPtr<nsIObserverService> obs = mozilla::services::GetObserverService()) {
    obs->RemoveObserver(this, "xpcom-will-shutdown");
  }
}

NS_IMETHODIMP
EngineAccessibility::Observe(nsISupports*, const char* aTopic, const char16_t*) {
  if (!strcmp(aTopic, "xpcom-will-shutdown")) Shutdown();
  return NS_OK;
}

EngineAccessibility::View* EngineAccessibility::Find(uint64_t aTarget) {
  for (auto& view : mViews)
    if (view.mTarget == aTarget) return &view;
  return nullptr;
}
EngineAccessibility::View* EngineAccessibility::FindContent(nsIContent* aContent) {
  for (auto& view : mViews)
    if (aContent && view.mCanvas.get() == aContent) return &view;
  return nullptr;
}

NS_IMETHODIMP
EngineAccessibility::GetPlatformClientActive(bool* aResult) {
#if defined(ACCESSIBILITY)
  *aResult = mozilla::a11y::ShouldA11yBeEnabled();
#else
  *aResult = false;
#endif
  return NS_OK;
}

NS_IMETHODIMP
EngineAccessibility::GetListener(nsIAxioEngineAccessibilityListener** aResult) {
  NS_IF_ADDREF(*aResult = mListener);
  return NS_OK;
}
NS_IMETHODIMP
EngineAccessibility::SetListener(nsIAxioEngineAccessibilityListener* aListener) {
  MOZ_ASSERT(NS_IsMainThread());
  mListener = aListener;
  return NS_OK;
}

NS_IMETHODIMP
EngineAccessibility::Attach(mozilla::dom::Element* aCanvas, uint64_t aTarget) {
  MOZ_ASSERT(NS_IsMainThread());
  if (mShutdown) return NS_ERROR_NOT_AVAILABLE;
  if (!aCanvas || !aTarget || !nsContentUtils::IsChromeDoc(aCanvas->OwnerDoc()) ||
      !aCanvas->IsHTMLElement(nsGkAtoms::canvas)) {
    return NS_ERROR_INVALID_ARG;
  }
  if (View* existing = Find(aTarget)) {
    ReleaseView(*existing);
    mViews.RemoveElementAt(existing - mViews.Elements());
  }
  if (FindContent(aCanvas) || mViews.Length() >= kMaxTargets) return NS_ERROR_INVALID_ARG;
  View* view = mViews.AppendElement();
  view->mTarget = aTarget;
  view->mCanvas = aCanvas;
  view->mTable = [[AxioEngineAXTable alloc] initWithTarget:aTarget];
  return NS_OK;
}

NS_IMETHODIMP
EngineAccessibility::Detach(uint64_t aTarget) {
  MOZ_ASSERT(NS_IsMainThread());
  if (View* view = Find(aTarget)) {
    id owner = [[TableOf(view->mTable)->mOwner retain] autorelease];
    ReleaseView(*view);
    mViews.RemoveElementAt(view - mViews.Elements());
    if (owner) NSAccessibilityPostNotification(owner, NSAccessibilityLayoutChangedNotification);
  }
  return NS_OK;
}

NS_IMETHODIMP
EngineAccessibility::ApplyPatch(uint64_t aTarget, const nsACString& aJSON) {
  MOZ_ASSERT(NS_IsMainThread());
  View* view = Find(aTarget);
  if (!view || aJSON.Length() > 64 * 1024 * 1024) return NS_ERROR_INVALID_ARG;
  @autoreleasepool {
    NSData* data = [NSData dataWithBytes:aJSON.BeginReading() length:aJSON.Length()];
    id patch = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
    if (![patch isKindOfClass:[NSDictionary class]]) return NS_ERROR_INVALID_ARG;
    [TableOf(view->mTable) applyPatch:patch];
  }
  return NS_OK;
}

NS_IMETHODIMP
EngineAccessibility::Clear(uint64_t aTarget) {
  MOZ_ASSERT(NS_IsMainThread());
  if (View* view = Find(aTarget)) {
    AxioEngineAXTable* table = TableOf(view->mTable);
    BOOL had = [table rootElement] != nil;
    [table clear];
    view->mRequested = false;  // the next assistive query asks chrome JS again
    if (had && table->mOwner) NSAccessibilityPostNotification(table->mOwner, NSAccessibilityLayoutChangedNotification);
  }
  return NS_OK;
}

void* EngineAccessibility::Children(void* aOwner, nsIContent* aContent) {
  View* view = FindContent(aContent);
  if (!view) return nil;
  AxioEngineAXTable* table = TableOf(view->mTable);
  [table setOwner:static_cast<id>(aOwner)];
  if (!view->mRequested && mListener) {
    view->mRequested = true;
    // Never re-enter chrome JS from inside an AppKit accessibility query.
    nsCOMPtr<nsIAxioEngineAccessibilityListener> listener = mListener;
    uint64_t target = view->mTarget;
    NS_DispatchToMainThread(NS_NewRunnableFunction("axio::EngineAccessibility::Requested", [listener, target]() {
      listener->OnAccessibilityRequested(target);
    }));
  }
  AxioEngineAXElement* root = [table rootElement];
  return root ? @[root] : @[];
}

void* EngineAccessibility::HitTest(void* aOwner, nsIContent* aContent, double aX, double aY) {
  View* view = FindContent(aContent);
  if (!view) return nil;
  AxioEngineAXTable* table = TableOf(view->mTable);
  [table setOwner:static_cast<id>(aOwner)];
  return [table hitTest:NSMakePoint(aX, aY)];
}

void* EngineAccessibility::Focused(mozilla::dom::Document* aDocument) {
  if (!aDocument) return nil;
  nsIContent* focused = aDocument->GetUnretargetedFocusedContent();
  for (auto& view : mViews) {
    if (view.mCanvas && view.mCanvas->OwnerDoc() == aDocument && FocusIsOn(view.mCanvas, focused)) {
      return [TableOf(view.mTable) focusedElement];
    }
  }
  return nil;
}

bool EngineAccessibility::IsContentFocused(uint64_t aTarget) const {
  for (const auto& view : mViews) {
    if (view.mTarget == aTarget && view.mCanvas) {
      return FocusIsOn(view.mCanvas, view.mCanvas->OwnerDoc()->GetUnretargetedFocusedContent());
    }
  }
  return false;
}

void EngineAccessibility::RequestAction(uint64_t aTarget, uint32_t aNode, const char* aAction,
                                        const nsAString& aValue) {
  if (!mListener || !aAction) return;
  nsCOMPtr<nsIAxioEngineAccessibilityListener> listener = mListener;
  nsCString action(aAction);
  nsString value(aValue);
  NS_DispatchToMainThread(NS_NewRunnableFunction("axio::EngineAccessibility::Action",
      [listener, aTarget, aNode, action, value]() { listener->OnAction(aTarget, aNode, action, value); }));
}

}  // namespace axio
