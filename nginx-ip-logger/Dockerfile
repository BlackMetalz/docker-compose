FROM nginx:alpine

# Copy static HTML page
COPY index.html /usr/share/nginx/html/index.html

# Copy Nginx configuration files
COPY default.conf /etc/nginx/conf.d/default.conf
COPY logging.conf /etc/nginx/conf.d/logging.conf

EXPOSE 80

# Start nginx in foreground and display access logs
CMD ["sh", "-c", "echo 'IP Logger started. Access logs will appear below:' && echo '-------------------------------------------' && nginx -g 'daemon off;' & tail -f /var/log/nginx/access.log"]