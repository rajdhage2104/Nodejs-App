# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the current directory contents into the container at /app
COPY . .

# Expose port 3000
EXPOSE 3000

# Define environment variables for MySQL connection
ENV MYSQL_HOST=localhost
ENV MYSQL_USER=your_mysql_username
ENV MYSQL_PASSWORD=your_mysql_password
ENV MYSQL_DATABASE=your_database_name

# Command to run your application
CMD ["node", "app.js"]
