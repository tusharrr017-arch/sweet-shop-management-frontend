#!/bin/bash

# Database setup script for Sweet Shop Management System

echo "Setting up database..."

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw sweet_shop_db; then
    echo "Database 'sweet_shop_db' already exists."
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb sweet_shop_db
        createdb sweet_shop_db
        echo "Database recreated."
    fi
else
    createdb sweet_shop_db
    echo "Database 'sweet_shop_db' created."
fi

# Run migrations
echo "Running migrations..."
psql -d sweet_shop_db -f migrations/001_initial_schema.sql

echo "Database setup complete!"

