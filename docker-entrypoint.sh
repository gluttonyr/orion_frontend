#!/bin/sh
set -eu

: "${VITE_API_URL:?Set VITE_API_URL to the public backend URL}"
envsubst '${VITE_API_URL}' \
  < /etc/nginx/templates/orion-config.js.template \
  > /usr/share/nginx/html/config.js
