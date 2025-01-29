FROM nginx:1.27.3
COPY build /usr/share/nginx/html
EXPOSE 80