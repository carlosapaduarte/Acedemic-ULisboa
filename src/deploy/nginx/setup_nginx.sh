#!/bin/bash

# Update package list
sudo apt update

# Install or update Nginx automatically
echo "Ensuring Nginx is installed and up to date..."
sudo apt-get install -y nginx

# Call the script to configure the Nginx site
./configure_nginx_site.sh

# Ensure Nginx is running
sudo systemctl enable nginx
sudo systemctl start nginx
