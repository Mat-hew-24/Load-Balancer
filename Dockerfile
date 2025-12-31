FROM node:25-alpine3.22

WORKDIR /app

# Copy root package.json for Next.js app
COPY package*.json ./
RUN npm install

# Copy scripts package.json for load balancer
COPY app/scripts/package*.json ./app/scripts/
RUN cd app/scripts && npm install

# Copy all application files
COPY . .

EXPOSE 3000 8080

# Start both Next.js dev server and load balancer
CMD sh -c "npm run dev"


#to run =>  docker run -p 3000:3000 -p 8080:8080 fullstack-one-container
