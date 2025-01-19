package main

import (
    "context"
    "database/sql"
    "fmt"
    "log"
    "time"

    _ "github.com/lib/pq"
)

const (
    host     = "localhost"
    port     = 5000
    user     = "postgres"
    password = "postgres"
    dbname   = "kienlt_db"
)

func main() {
    var db *sql.DB
    var err error

    for {
        psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
            host, port, user, password, dbname)

        db, err = sql.Open("postgres", psqlInfo)
        if err != nil {
            log.Printf("Unable to connect to database: %v\n", err)
            time.Sleep(5 * time.Second)
            continue
        }

        ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
        defer cancel()

        err = db.PingContext(ctx)
        if err != nil {
            log.Printf("Unable to connect to database: %v\n", err)
            time.Sleep(5 * time.Second)
            continue
        }

        break
    }
    defer db.Close()

	for {
        ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)

        var isReplica bool
        err = db.QueryRowContext(ctx, "SELECT pg_is_in_recovery()").Scan(&isReplica)
        if err != nil {
            log.Printf("Query failed: %v\n", err)
            cancel()
            time.Sleep(5 * time.Second)
            continue
        }

        if isReplica {
            fmt.Println("Current server is a replica.")
        } else {
            fmt.Println("Current server is the primary.")
        }

        rows, err := db.QueryContext(ctx, "SELECT id, name, position, salary, hire_date FROM sample_data")
        if err != nil {
            log.Printf("Query failed: %v\n", err)
            cancel()
            time.Sleep(5 * time.Second)
            continue
        }
        defer rows.Close()

        fmt.Println("ID | Name | Position | Salary | Hire Date")
        for rows.Next() {
            var id int
            var name, position string
            var salary float64
            var hireDate time.Time

            err := rows.Scan(&id, &name, &position, &salary, &hireDate)
            if err != nil {
                log.Printf("Row scan failed: %v\n", err)
                continue
            }
            fmt.Printf("%d | %s | %s | %.2f | %s\n", id, name, position, salary, hireDate.Format("2006-01-02"))
        }

        cancel()
        time.Sleep(5 * time.Second)
    }
}