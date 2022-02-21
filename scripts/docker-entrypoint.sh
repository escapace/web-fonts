#!/bin/sh

set -o errexit
set -o nounset

if [ -z ${UID+x} ]; then
  echo "UID not set"
  exit 1
fi

if [ -z ${GID+x} ]; then
  echo "UID not set"
  exit 1
fi

addgroup -S -g "${GID}" node \
  && adduser -S -u "${UID}" -G node -s /bin/sh node \
  && umask "${UMASK}" \
  && mkdir -p /wd \
  && chown node:node /wd \
  && cd /wd \
  && chown "${UID}:${GID}" \
    /usr/local/lib/node_modules/@escapace/web-fonts/src/utilities/font-loader.ts \
    /usr/local/lib/node_modules/@escapace/web-fonts/src/utilities/font-strip.py \
  && exec sudo -u node web-fonts "$@"
