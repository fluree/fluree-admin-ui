FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY build /usr/share/nginx/html
