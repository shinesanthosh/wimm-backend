#!/bin/bash

# Setup test database for WIMM Backend
echo "Setting up test database..."

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    exit 1
fi

# Try to create test database and tables
# You may need to adjust the password or use --password=yourpassword
mysql -u root -ppassword < tests/setup-db.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Test database setup completed successfully"
else
    echo "⚠️  Database setup may have failed. Please run manually:"
    echo "   mysql -u root -p < tests/setup-db.sql"
fi