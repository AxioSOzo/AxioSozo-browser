#!/bin/sh
# TEST FIXTURE ONLY: stands in for the native Keychain helper. Touches no Keychain, reads no
# credential. Mirrors the helper's argv contract: `<operation> [jev|openai]`, exit 44 = no item.
[ "$#" -ge 1 ] && [ "$#" -le 2 ] || exit 2
provider="${2:-jev}"
case "$provider" in jev|openai) ;; *) exit 2 ;; esac
case "$1" in
  read) [ "$provider" = jev ] || exit 44; printf 'argc=%s args=%s' "$#" "$*" ;;
  exists) [ "$provider" = jev ] || exit 44 ;;
  store) key=$(cat); [ "$key" = "synthetic-store-key-$provider" ] || exit 1 ;;
  remove) [ "$provider" = jev ] || exit 44 ;;
  *) exit 1 ;;
esac
