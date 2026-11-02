#!/bin/bash

echo "start.sh";
NGINX_PORT=${NGINX_PORT:-80}
echo NGINX_PORT=${NGINX_PORT}
sed -i "s/listen       80;/listen ${NGINX_PORT};/" /etc/nginx/conf.d/default.conf

# Server-level tuning: cache headers and gzip (?v=<version> in every asset URL).
SNIPPETS_GLOB=/etc/nginx/snippets/*.conf
if ! grep -qF "include $SNIPPETS_GLOB;" /etc/nginx/conf.d/default.conf; then
    sed -i -e "0,/server/ s|^[[:space:]]*server[[:space:]]*{|&\n    include $SNIPPETS_GLOB;|" /etc/nginx/conf.d/default.conf
fi

exec nginx -g "daemon off;"