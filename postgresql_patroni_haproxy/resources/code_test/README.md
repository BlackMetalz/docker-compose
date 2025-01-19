### Usage
- Change information in main.go, assume db already created and have sample data.
```
const (
    host     = "localhost"
    port     = 5000
    user     = "postgres"
    password = "postgres"
    dbname   = "kienlt_db"
)
```

```
# Init module
go mod tidy 
# Run the fucking program
go run main.go
```