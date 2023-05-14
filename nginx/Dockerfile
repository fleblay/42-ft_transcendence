FROM nginx:1.17.6-alpine as production
COPY nginx.conf /etc/nginx/nginx.conf

FROM nginx:1.17.6-alpine as development
COPY nginx_dev.conf /etc/nginx/nginx.conf


FROM build