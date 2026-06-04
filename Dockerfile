FROM nginx:alpine

# Remove default nginx site
RUN rm /usr/share/nginx/html/*

# Copy all app files
COPY index.html /usr/share/nginx/html/
COPY nov-typing/ /usr/share/nginx/html/nov-typing/
COPY rotavirus-a-typing/ /usr/share/nginx/html/rotavirus-a-typing/

# Custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
