#!/bin/bash

# Define configuration paths
SITE_AVAILABLE_CONFIG_PATH="/etc/nginx/sites-available/acedemic.studentlife.ulisboa.pt.conf"
SITE_ENABLED_LINK="/etc/nginx/sites-enabled/acedemic.studentlife.ulisboa.pt.conf"
LOCAL_CONFIG="nginx.conf"

# Check if the configuration file exists
if [ -f "$SITE_AVAILABLE_CONFIG_PATH" ]; then
    # Compare the existing configuration with the new one
    if ! cmp -s "$LOCAL_CONFIG" "$SITE_AVAILABLE_CONFIG_PATH"; then
        echo "The configuration file at $SITE_AVAILABLE_CONFIG_PATH has changes. Manual review is required."
        exit 1
    fi
    echo "Nginx site configuration is already up to date."
else
    # Copy the new configuration if it does not exist
    echo "Setting up Nginx site configuration..."
    sudo cp "$LOCAL_CONFIG" "$SITE_AVAILABLE_CONFIG_PATH"
    echo "Configuration file copied to $SITE_AVAILABLE_CONFIG_PATH."
fi

# Create a symlink in sites-enabled if it does not exist
if [ ! -L "$SITE_ENABLED_LINK" ]; then
    sudo ln -s "$SITE_AVAILABLE_CONFIG_PATH" "$SITE_ENABLED_LINK"
    echo "Symlink created for $SITE_AVAILABLE_CONFIG_PATH."
fi

# Reload Nginx to apply changes
sudo systemctl reload nginx
echo "Nginx reloaded."
