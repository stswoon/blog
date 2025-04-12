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