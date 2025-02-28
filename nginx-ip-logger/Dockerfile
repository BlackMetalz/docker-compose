FROM nginx:alpine

# Create a static HTML page
RUN echo '<html><head><title>IP Logger</title><style>body{font-family:sans-serif; max-width:800px; margin:0 auto; padding:20px;} h1{color:#333;} .message{font-size:18px; margin:20px 0;}</style></head><body><h1>IP Address Logger</h1><p class="message">Your visit has been logged on the server.</p><p>Access the JSON endpoint at <a href="/api/ip">/api/ip</a> to see your IP details.</p></body></html>' > /usr/share/nginx/html/index.html

# Configure Nginx with JSON API endpoint - fixed line breaks
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '        index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api/ip {' >> /etc/nginx/conf.d/default.conf && \
    echo '        default_type application/json;' >> /etc/nginx/conf.d/default.conf && \
    echo '        return 200 "{\"ip\":\"$remote_addr\",\"time\":\"$time_local\",\"user_agent\":\"$http_user_agent\"}";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Setup enhanced logging - fixed line breaks
RUN echo 'log_format ip_log "$time_local | CLIENT IP: $remote_addr | REQUEST: $request | AGENT: $http_user_agent";' > /etc/nginx/conf.d/logging.conf && \
    echo 'access_log /var/log/nginx/access.log ip_log;' >> /etc/nginx/conf.d/logging.conf

EXPOSE 80

# Start nginx in foreground and display access logs
CMD ["sh", "-c", "echo 'IP Logger started. Access logs will appear below:' && echo '-------------------------------------------' && nginx -g 'daemon off;' & tail -f /var/log/nginx/access.log"]