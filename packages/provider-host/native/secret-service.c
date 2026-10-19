/* Linux equivalent of keychain.m: one Secret Service (libsecret) item per decision
 * provider. Same argv/stdin/stdout/exit contract:
 *   <read|store|exists|remove> [jev|openai]
 *   0 success, 44 no item, 2 invalid input, 1 refused/unavailable (never a fallback).
 * Secrets pass via owned pipes only; never argv, logs, files or plaintext storage.
 *
 * Fail closed: no Secret Service on the session bus, a locked collection or a
 * locked item returns 1. The helper never asks the service to unlock anything
 * (no prompt), never creates a collection, and never falls back to a file. */
#include <libsecret/secret.h>
#include <stdio.h>
#include <string.h>

#define MAX_SECRET 4096

static const SecretSchema SCHEMA = {
  "nl.axiosozo.browser.dev.ProviderKey", SECRET_SCHEMA_NONE,
  { { "service", SECRET_SCHEMA_ATTRIBUTE_STRING }, { "account", SECRET_SCHEMA_ATTRIBUTE_STRING }, { NULL, 0 } },
};

static void wipe(void *buffer, size_t size) {
  volatile unsigned char *bytes = buffer;
  while (size--) *bytes++ = 0;
}

static GHashTable *attributes(int openai) {
  GHashTable *table = g_hash_table_new(g_str_hash, g_str_equal);
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
  /* Separate test binary: a fixture-only service/account no real item uses. */
  g_hash_table_insert(table, "service", openai ? "nl.axiosozo.browser.dev.openai.negative-fixture"
                                               : "nl.axiosozo.browser.dev.jev.negative-fixture");
  g_hash_table_insert(table, "account", "synthetic-no-key");
#else
  g_hash_table_insert(table, "service", openai ? "nl.axiosozo.browser.dev.openai" : "nl.axiosozo.browser.dev.jev");
  g_hash_table_insert(table, "account", "user-supplied-api-key");
#endif
  return table;
}

/* Items without unlocking: 1 = refused (no service / error), else a list (may be empty). */
static int search(SecretService *service, GHashTable *query, SecretSearchFlags flags, GList **items) {
  GError *error = NULL;
  *items = secret_service_search_sync(service, &SCHEMA, query, flags | SECRET_SEARCH_ALL, NULL, &error);
  if (error) { g_error_free(error); return 1; }
  return 0;
}

static int any_locked(GList *items) {
  for (GList *item = items; item; item = item->next)
    if (secret_item_get_locked(SECRET_ITEM(item->data))) return 1;
  return 0;
}

int main(int argc, char **argv) {
  if (argc != 2 && argc != 3) return 2;
  int openai = 0;
  if (argc == 3) {
    if (!strcmp(argv[2], "openai")) openai = 1;
    else if (strcmp(argv[2], "jev")) return 2;
  }
  const char *operation = argv[1];
  int lookup = !strcmp(operation, "read"), exists = !strcmp(operation, "exists");
  int store = !strcmp(operation, "store"), remove_item = !strcmp(operation, "remove");
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
  if (!lookup && !exists) return 2; /* never mutates */
#endif
  if (!lookup && !exists && !store && !remove_item) return 1;

  unsigned char buffer[MAX_SECRET + 1];
  size_t size = 0;
  if (store) {
    size = fread(buffer, 1, sizeof(buffer), stdin);
    if (size < 8 || size > MAX_SECRET || memchr(buffer, '\n', size) || memchr(buffer, '\r', size) || memchr(buffer, 0, size)) {
      wipe(buffer, sizeof(buffer));
      return 2;
    }
  }

  GError *error = NULL;
  /* Opens a transfer session only; nothing is unlocked or prompted. */
  SecretService *service = secret_service_get_sync(SECRET_SERVICE_OPEN_SESSION, NULL, &error);
  if (!service) {
    if (error) g_error_free(error);
    wipe(buffer, sizeof(buffer));
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
    fprintf(stderr, "TEST_FIXTURE secret_service=unavailable\n");
#endif
    return 1;
  }
  GHashTable *query = attributes(openai);
  GList *items = NULL;
  int status = 1;

  if (lookup || exists) {
    if (search(service, query, lookup ? SECRET_SEARCH_LOAD_SECRETS : SECRET_SEARCH_NONE, &items) == 0) {
      if (!items) status = 44;
      else if (any_locked(items)) status = 1; /* locked: refuse, never prompt */
      else if (exists) status = 0;
      else {
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
        fprintf(stderr, "TEST_FIXTURE unexpected_item\n");
        status = 70; /* never emit data from the fixture build */
#else
        SecretValue *value = secret_item_get_secret(SECRET_ITEM(items->data));
        gsize length = 0;
        const gchar *bytes = value ? secret_value_get(value, &length) : NULL;
        if (bytes && length >= 1 && length <= MAX_SECRET) {
          status = fwrite(bytes, 1, length, stdout) == length ? 0 : 1;
        }
        if (value) secret_value_unref(value);
#endif
      }
    }
#ifdef AXIOSOZO_KEYCHAIN_NEGATIVE_TEST
    fprintf(stderr, "TEST_FIXTURE secret_service=available result=%d\n", status);
#endif
  } else if (store) {
    /* Only into an existing, unlocked default collection: no prompt, no new collection. */
    SecretCollection *collection = secret_collection_for_alias_sync(service, SECRET_COLLECTION_DEFAULT,
                                                                    SECRET_COLLECTION_NONE, NULL, &error);
    if (collection && !secret_collection_get_locked(collection)
        && search(service, query, SECRET_SEARCH_NONE, &items) == 0 && !any_locked(items)) {
      SecretValue *value = secret_value_new((const gchar *)buffer, (gssize)size, "text/plain");
      SecretItem *item = secret_item_create_sync(collection, &SCHEMA, query, openai ? "AxioSozo Dev OpenAI key" : "AxioSozo Dev Jev key",
                                                 value, SECRET_ITEM_CREATE_REPLACE, NULL, &error);
      status = item ? 0 : 1;
      if (item) g_object_unref(item);
      secret_value_unref(value);
    }
    if (collection) g_object_unref(collection);
  } else if (remove_item) {
    if (search(service, query, SECRET_SEARCH_NONE, &items) == 0) {
      if (!items) status = 44;
      else if (any_locked(items)) status = 1;
      else {
        status = 0;
        for (GList *item = items; item; item = item->next)
          if (!secret_item_delete_sync(SECRET_ITEM(item->data), NULL, NULL)) status = 1;
      }
    }
  }
  wipe(buffer, sizeof(buffer));
  if (error) g_error_free(error);
  g_list_free_full(items, g_object_unref);
  g_hash_table_unref(query);
  g_object_unref(service);
  return status;
}
