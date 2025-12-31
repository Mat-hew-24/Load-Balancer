FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Expose HTTP
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

#to run => docker run -d --name nginx-entry -p 80:80 nginx-entry
