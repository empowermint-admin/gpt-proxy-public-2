# Use Node.js LTS with full module support
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of app
COPY . .

# Railway expects port 3000
ENV PORT=3000
EXPOSE 3000

# Run app using ES module
CMD [ "node", "index.js" ]
