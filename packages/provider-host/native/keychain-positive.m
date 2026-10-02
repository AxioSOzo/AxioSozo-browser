#import <Foundation/Foundation.h>
#import <LocalAuthentication/LocalAuthentication.h>
#include <Security/Security.h>
#include <limits.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

/* TEST_FIXTURE ONLY. Public legacy APIs are needed to create a separately scoped
 * file keychain. No production helper, default/search-list API, SecKeychainDelete,
 * provider, or networking is used. Apple StorageManager::shouldAddToSearchList
 * excludes private keychains; this exact filename must never be login.keychain.
 * The parent deletes only this newly created test directory after process exit. */
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
static OSStatus disableInteraction(void) { return SecKeychainSetUserInteractionAllowed(false); }
static OSStatus interactionAllowed(Boolean *allowed) { return SecKeychainGetUserInteractionAllowed(allowed); }
static OSStatus createPrivate(const char *file, const char *password, SecKeychainRef *keychain) {
  return SecKeychainCreate(file, (UInt32)strlen(password), password, false, NULL, keychain);
}
static OSStatus lockPrivate(SecKeychainRef keychain) { return SecKeychainLock(keychain); }
#pragma clang diagnostic pop

static NSMutableDictionary *scope(SecKeychainRef keychain, LAContext *context) {
  // Never call this with NULL: the explicit singleton list is the read/delete/update scope.
  if (!keychain) abort();
  return [@{ (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService: @"nl.axiosozo.browser.dev.jev.positive-fixture",
    (__bridge id)kSecAttrAccount: @"synthetic-only",
    (__bridge id)kSecMatchSearchList: @[(__bridge id)keychain],
    (__bridge id)kSecUseAuthenticationContext: context } mutableCopy];
}

static OSStatus readPrivate(SecKeychainRef keychain, LAContext *context, NSData *expected, bool *matched) {
  NSMutableDictionary *query = scope(keychain, context);
  query[(__bridge id)kSecReturnData] = @YES;
  query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitOne;
  CFTypeRef found = NULL;
  OSStatus result = SecItemCopyMatching((__bridge CFDictionaryRef)query, &found);
  *matched = result == errSecSuccess && found && CFGetTypeID(found) == CFDataGetTypeID()
    && expected && [(__bridge NSData *)found isEqualToData:expected];
  if (found) CFRelease(found);
  return result;
}

/* Match storage.py's volume-root or one named build root. Parse complete path
 * components before resolving filesystem paths; prefix matches alone are unsafe.
 * The two validation-only modes exercise this exact policy without Keychain APIs. */
static bool fixturePathAllowed(const char *directory) {
  const char *volume = "/Volumes/AxioSozoBuild/";
  const char *fixture = "providers/keychain-runs/positive-";
  const char *reserved[] = { "zen", "toolchains", "cargo-home", "cargo-target", "caches", "runtime", "tmp",
    "cef", "providers", "logs", "release", "diag", "diagnostics", "gui-fixtures" };
  if (strlen(directory) >= PATH_MAX || strncmp(directory, volume, strlen(volume))) return false;
  const char *relative = directory + strlen(volume);
  if (strncmp(relative, fixture, strlen(fixture))) {
    const char *separator = strchr(relative, '/');
    if (!separator) return false;
    size_t length = (size_t)(separator - relative);
    if (!length || length > 40 || !((relative[0] >= 'a' && relative[0] <= 'z')
      || (relative[0] >= '0' && relative[0] <= '9'))) return false;
    for (size_t i = 0; i < length; i++) {
      char character = relative[i];
      if (!((character >= 'a' && character <= 'z') || (character >= '0' && character <= '9')
        || character == '-')) return false;
    }
    for (size_t i = 0; i < sizeof(reserved) / sizeof(reserved[0]); i++) {
      if (strlen(reserved[i]) == length && !strncmp(relative, reserved[i], length)) return false;
    }
    relative = separator + 1;
    if (strncmp(relative, fixture, strlen(fixture))) return false;
  }
  const char *suffix = relative + strlen(fixture);
  size_t length = strlen(suffix);
  if (!length || length > 64) return false;
  for (size_t i = 0; i < length; i++) {
    char character = suffix[i];
    if (!((character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z')
      || (character >= '0' && character <= '9'))) return false;
  }
  return true;
}

static bool fixtureDirectoryAllowed(const char *requested) {
  char canonical[PATH_MAX]; struct stat info;
  return fixturePathAllowed(requested) && realpath(requested, canonical)
    && !strcmp(requested, canonical) && !lstat(requested, &info)
    && S_ISDIR(info.st_mode) && info.st_uid == getuid() && !(info.st_mode & 077);
}

static int invalidFixtureDirectory(void) {
  fputs("TEST_FIXTURE: rejected private-keychain directory or existing fixture file\n", stderr);
  return 64;
}

int main(int argc, char **argv) {
  @autoreleasepool {
    if (argc == 3 && !strcmp(argv[1], "--validate-path"))
      return fixturePathAllowed(argv[2]) ? 0 : invalidFixtureDirectory();
    if (argc == 3 && !strcmp(argv[1], "--validate-directory"))
      return fixtureDirectoryAllowed(argv[2]) ? 0 : invalidFixtureDirectory();
    if (argc != 2 || !fixtureDirectoryAllowed(argv[1])) return invalidFixtureDirectory();
    char file[PATH_MAX]; struct stat info;
    if (snprintf(file, sizeof(file), "%s/axiosozo-synthetic.keychain", argv[1]) >= (int)sizeof(file))
      return invalidFixtureDirectory();
    if (!lstat(file, &info) || errno != ENOENT) return invalidFixtureDirectory();
    NSMutableArray *steps = [NSMutableArray array];
    NSMutableDictionary *report = [@{ @"label": @"TEST_FIXTURE", @"status": @"BLOCKED_ENV",
      @"scope": @"one new private keychain on T9", @"steps": steps,
      @"default_keychain_apis_called": @NO, @"search_list_mutation_apis_called": @NO,
      @"key_data_logged": @NO, @"network_used": @NO } mutableCopy];
    SecKeychainRef keychain = NULL; int exitCode = 78; OSStatus result; Boolean interaction = true;
    char password[65] = {0}; unsigned char random[32] = {0};
    LAContext *context = [[LAContext alloc] init]; context.interactionNotAllowed = YES;
    NSMutableData *first = nil, *second = nil;
#define RECORD(name, value) [steps addObject:@{ @"operation": name, @"status": @((int)(value)) }]
    result = disableInteraction(); RECORD(@"disable_interaction", result); if (result) goto finish;
    result = interactionAllowed(&interaction); RECORD(@"read_process_interaction_setting", result);
    report[@"interaction_allowed"] = @(interaction);
    if (result || interaction) goto finish;
    result = SecRandomCopyBytes(kSecRandomDefault, sizeof(random), random); if (result) goto finish;
    for (size_t i = 0; i < sizeof(random); i++) snprintf(password + i * 2, 3, "%02x", random[i]);
    memset_s(random, sizeof(random), 0, sizeof(random));
    result = createPrivate(file, password, &keychain); RECORD(@"create_private_keychain", result);
    memset_s(password, sizeof(password), 0, sizeof(password));
    if (result || !keychain) goto finish;
    first = [NSMutableData dataWithLength:32]; second = [NSMutableData dataWithLength:32];
    if (SecRandomCopyBytes(kSecRandomDefault, first.length, first.mutableBytes)
      || SecRandomCopyBytes(kSecRandomDefault, second.length, second.mutableBytes)) goto finish;
    {
      NSMutableDictionary *query = scope(keychain, context);
      result = SecItemUpdate((__bridge CFDictionaryRef)query,
        (__bridge CFDictionaryRef)@{ (__bridge id)kSecValueData: first });
      RECORD(@"update_absent_scoped_item", result);
      if (result != errSecItemNotFound) { exitCode = 1; goto finish; }
      NSMutableDictionary *attributes = [query mutableCopy];
      [attributes removeObjectForKey:(__bridge id)kSecMatchSearchList];
      attributes[(__bridge id)kSecUseKeychain] = (__bridge id)keychain;
      attributes[(__bridge id)kSecValueData] = first;
      result = SecItemAdd((__bridge CFDictionaryRef)attributes, NULL); RECORD(@"add_scoped_item", result);
      if (result) goto finish;
      bool matched = false; result = readPrivate(keychain, context, first, &matched); RECORD(@"read_scoped_item", result);
      report[@"first_read_matches"] = @(matched); if (result || !matched) { exitCode = 1; goto finish; }
      result = SecItemUpdate((__bridge CFDictionaryRef)query,
        (__bridge CFDictionaryRef)@{ (__bridge id)kSecValueData: second });
      RECORD(@"replace_scoped_item", result); if (result) goto finish;
      result = readPrivate(keychain, context, second, &matched); RECORD(@"read_replaced_scoped_item", result);
      report[@"replacement_read_matches"] = @(matched); if (result || !matched) { exitCode = 1; goto finish; }
      result = SecItemDelete((__bridge CFDictionaryRef)query); RECORD(@"delete_scoped_item", result); if (result) goto finish;
      result = readPrivate(keychain, context, nil, &matched); RECORD(@"verify_scoped_item_absent", result);
      if (result != errSecItemNotFound) { exitCode = 1; goto finish; }
      exitCode = 0;
    }
finish:
    memset_s(password, sizeof(password), 0, sizeof(password));
    memset_s(random, sizeof(random), 0, sizeof(random));
    if (first) [first resetBytesInRange:NSMakeRange(0, first.length)];
    if (second) [second resetBytesInRange:NSMakeRange(0, second.length)];
    if (keychain) { result = lockPrivate(keychain); RECORD(@"lock_private_keychain", result); if (result && !exitCode) exitCode = 78; CFRelease(keychain); }
    report[@"status"] = exitCode == 0 ? @"PASS" : exitCode == 78 ? @"BLOCKED_ENV" : @"FAIL";
    NSData *json = [NSJSONSerialization dataWithJSONObject:report options:NSJSONWritingSortedKeys error:NULL];
    if (json) { fwrite(json.bytes, 1, json.length, stdout); fputc('\n', stdout); }
    return exitCode;
  }
}
