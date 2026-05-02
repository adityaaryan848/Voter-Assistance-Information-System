FROM nginx:alpine

# Copy the Nginx config template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Copy the static website files
COPY . /usr/share/nginx/html

# Expose port (Cloud Run sets the PORT environment variable)
EXPOSE 8080

# Cloud Run sets the PORT env var, the nginx template handles the substitution
CMD ["nginx", "-g", "daemon off;"]
