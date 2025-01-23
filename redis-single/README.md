### Purpose for this 23/01/2025
- Check backup and restore redis
- Copy .rdb file with to data folder with name `dump.rdb`
- Test data restore by command (below is example output)
```
redis-cli -a password info keyspace
Warning: Using a password with '-a' or '-u' option on the command line interface may not be safe.
# Keyspace
db1:keys=130768,expires=128004,avg_ttl=178747363
```