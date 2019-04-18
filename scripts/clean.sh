#!/bin/bash
set -eo pipefail

find src -type f \( -name '*.js' -o -name '*.map' \) -exec rm {} \+ &
rm -rf node_modules/.cache dist

wait
