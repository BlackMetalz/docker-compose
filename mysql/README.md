## Create test table
```bash
USE test;
CREATE TABLE IF NOT EXISTS test_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Insert + Select script non-stop
```bash
#!/bin/bash

# --- Init var ---
DB_HOST="127.0.0.1"        # Host here!
DB_PORT="3306"
DB_USER="root"
DB_PASS="123123"
DB_NAME="test"

MYSQL_CMD="mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASS"

echo "Ctrl+C to stop"

while true; do
    # 1. Insert 1 record
    $MYSQL_CMD $DB_NAME -e "INSERT INTO test_table () VALUES ();"
    
    # 2. Select Count
    COUNT=$($MYSQL_CMD $DB_NAME -N -s -e "SELECT COUNT(*) FROM test_table;")
    
    echo "[$(date +'%H:%M:%S')] Host: $DB_HOST | Inserted. Total: $COUNT"
    
    sleep 0.2
done
```

## Python script
```bash
pip install mysql-connector-python
```