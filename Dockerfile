FROM node:25-alpine3.22

WORKDIR /app

# Install nginx in the Node Alpine image
RUN apk add --no-cache nginx && \
	mkdir -p /run/nginx /var/log/nginx /var/cache/nginx

# Copy root package.json for Next.js app
COPY package*.json ./
RUN npm install

# Copy scripts package.json for load balancer
COPY app/scripts/package*.json ./app/scripts/
RUN cd app/scripts && npm install

# Copy all application files
COPY . .

# Copy nginx config into container
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Add entrypoint script to launch both Node and NGINX
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose ports: 80 (NGINX), 3000 (Next), 8080 (LB)
EXPOSE 80 3000 8080

# Launch Node services then keep NGINX in foreground
CMD ["/app/docker-entrypoint.sh"]

# Example run:
# docker build -t load-balancer-unified .
# docker run -d --name load-balancer-unified-test -p 80:80 -p 3000:3000 -p 8080:8080 load-balancer-unified
