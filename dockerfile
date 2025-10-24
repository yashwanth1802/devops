# Use Nginx as base image
FROM nginx:latest

# Copy your web files into Nginx default folder
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80