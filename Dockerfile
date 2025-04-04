# Use official Node.js image
FROM node:lts

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose your application port (if needed)
EXPOSE 4000

# Start the app
CMD ["npm", "run", "start"]
