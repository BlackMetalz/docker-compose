# Ref
- https://github.com/patroni/patroni/tree/master

# Star the cluster
```
docker compose up -d
```
# This setup provides
- 3-node etcd cluster for high availability
- 3-node Patroni/PostgreSQL cluster
- 1 HAProxy instances for load balancing xD
- Ability to test various failure scenarios while maintaining service


# Usage
- Require postgresql cli
```
apt-get install postgresql-client -y
```
- Exec into shell to primary. Secondary is 5001
```
psql -h localhost -p 5000 -U postgres
```

- Test failover scenarios
```
docker stop demo-etcd1
docker stop demo-patroni1
```



- Check etcd cluster health
```
docker exec -it demo-etcd1 etcdctl endpoint health --cluster
```

- Check Patroni cluster status
```
docker exec -it demo-patroni1 patronictl list
```

- Some common postgresql command:
```
# Check replication slots
SELECT * FROM pg_replication_slots;
# List replicas
SELECT * FROM pg_stat_replication;
```