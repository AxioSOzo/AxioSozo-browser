#import <Foundation/Foundation.h>
#import <LocalAuthentication/LocalAuthentication.h>
#include <CoreFoundation/CoreFoundation.h>
#include <Security/Security.h>
#include <stdio.h>
#include <string.h>

/* Only this development service/account. Never reads provider credentials.
 * Secrets pass via owned pipes, never argv, logs, files, or browser storage. */
int main(int argc, char **argv) {
  @autoreleasepool {
  if (argc != 2) return 2;
  CFMutableDictionaryRef query = CFDictionaryCreateMutable(NULL, 0,
      &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
  CFDictionarySetValue(query, kSecClass, kSecClassGenericPassword);
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
  /* Separate test binary only: no actual keychain is in the search scope.
   * kSecMatchSearchList explicitly limits queries to the supplied array.
   * Do not enable mutation in this build or expose a runtime test toggle. */
  CFDictionarySetValue(query, kSecAttrService, CFSTR("nl.axiosozo.browser.dev.jev.negative-fixture"));
  CFDictionarySetValue(query, kSecAttrAccount, CFSTR("synthetic-no-key"));
  CFArrayRef empty = CFArrayCreate(NULL, NULL, 0, &kCFTypeArrayCallBacks);
  CFDictionarySetValue(query, kSecMatchSearchList, empty);
  CFRelease(empty);
#else
  CFDictionarySetValue(query, kSecAttrService, CFSTR("nl.axiosozo.browser.dev.jev"));
  CFDictionarySetValue(query, kSecAttrAccount, CFSTR("user-supplied-api-key"));
#endif
  LAContext *context = [[LAContext alloc] init];
  context.interactionNotAllowed = YES;
  CFDictionarySetValue(query, kSecUseAuthenticationContext, (__bridge CFTypeRef)context);
  OSStatus status = errSecParam;
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
  if (!strcmp(argv[1], "invalid-query")) {
    CFDictionarySetValue(query, kSecClass, CFSTR("AXIOSOZO_INVALID_TEST_CLASS"));
    status = SecItemCopyMatching(query, NULL);
    fprintf(stderr, "TEST_FIXTURE keychain_status=%d search_list=empty\n", (int)status);
    CFRelease(query);
    return status == errSecParam ? 1 : 70;
  }
  if (strcmp(argv[1], "read") && strcmp(argv[1], "exists")) { CFRelease(query); return 2; }
#endif
  if (!strcmp(argv[1], "read")) {
    CFDictionarySetValue(query, kSecReturnData, kCFBooleanTrue);
    CFTypeRef found = NULL;
    status = SecItemCopyMatching(query, &found);
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
    if (status == errSecSuccess) {
      if (found) CFRelease(found);
      CFRelease(query);
      fprintf(stderr, "TEST_FIXTURE unexpected_success search_list=empty\n");
      return 70; // Never emit data, even if the empty-scope invariant is violated.
    }
#endif
    if (status == errSecSuccess && found && CFGetTypeID(found) == CFDataGetTypeID()) {
      CFDataRef data = (CFDataRef)found;
      if (CFDataGetLength(data) > 4096) status = errSecParam;
      else fwrite(CFDataGetBytePtr(data), 1, (size_t)CFDataGetLength(data), stdout);
    }
    if (found) CFRelease(found);
  } else if (!strcmp(argv[1], "exists")) {
    /* Presence only: no kSecReturnData/Attributes/Ref is requested, so no secret or
     * attribute leaves Security.framework and nothing is written to stdout.
     * 0 = an item exists, 44 = no item, 1 = Keychain refused (e.g. locked). */
    status = SecItemCopyMatching(query, NULL);
  } else if (!strcmp(argv[1], "store")) {
    unsigned char buffer[4097]; size_t size = fread(buffer, 1, sizeof(buffer), stdin);
    if (size < 8 || size > 4096 || memchr(buffer, '\n', size) || memchr(buffer, '\r', size) || memchr(buffer, 0, size)) { memset_s(buffer, sizeof(buffer), 0, sizeof(buffer)); CFRelease(query); return 2; }
    CFDataRef secret = CFDataCreate(NULL, buffer, (CFIndex)size);
    memset_s(buffer, sizeof(buffer), 0, sizeof(buffer));
    CFMutableDictionaryRef update = CFDictionaryCreateMutable(NULL, 0, &kCFTypeDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);
    CFDictionarySetValue(update, kSecValueData, secret);
    status = SecItemUpdate(query, update);
    if (status == errSecItemNotFound) {
      CFDictionarySetValue(query, kSecValueData, secret);
      CFDictionarySetValue(query, kSecAttrAccessible, kSecAttrAccessibleWhenUnlockedThisDeviceOnly);
      status = SecItemAdd(query, NULL);
    }
    CFRelease(update); CFRelease(secret);
  } else if (!strcmp(argv[1], "remove")) status = SecItemDelete(query);
  CFRelease(query);
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
  fprintf(stderr, "TEST_FIXTURE keychain_status=%d search_list=empty\n", (int)status);
#endif
  if (status == errSecItemNotFound) return 44;
  if (status != errSecSuccess) return 1;
  return 0;
  }
}
