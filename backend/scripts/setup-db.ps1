# Database setup script for Sweet Shop Management System (PowerShell)

Write-Host "Setting up database..." -ForegroundColor Green

# Check if database exists
$dbExists = psql -lqt | Select-String -Pattern "sweet_shop_db"

if ($dbExists) {
    Write-Host "Database 'sweet_shop_db' already exists." -ForegroundColor Yellow
    $recreate = Read-Host "Do you want to drop and recreate it? (y/N)"
    if ($recreate -eq "y" -or $recreate -eq "Y") {
        dropdb sweet_shop_db
        createdb sweet_shop_db
        Write-Host "Database recreated." -ForegroundColor Green
    }
} else {
    createdb sweet_shop_db
    Write-Host "Database 'sweet_shop_db' created." -ForegroundColor Green
}

# Run migrations
Write-Host "Running migrations..." -ForegroundColor Green
psql -d sweet_shop_db -f migrations/001_initial_schema.sql

Write-Host "Database setup complete!" -ForegroundColor Green

