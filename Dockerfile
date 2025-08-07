FROM node:22.11.0 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY spec ./spec
COPY blogengine.mjs ./blogengine.mjs
RUN npm run build:prod

FROM nginx:1.27.3
COPY --from=builder /app/build ./usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
COPY start.sh /etc/nginx/
RUN chmod +x /etc/nginx/start.sh
ARG NGINX_PORT
EXPOSE $NGINX_PORT
CMD "/etc/nginx/start.sh"

# docker build . -t blog
# docker run --rm --name blog -p 80:80 -e PORT=80 blog