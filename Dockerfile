# Use Node.js LTS image (non-alpine to avoid missing packages)
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Railway expects port 3000
ENV PORT=3000
EXPOSE 3000

# Start the app using ES Module support
CMD [ "node", "index.js" ]
