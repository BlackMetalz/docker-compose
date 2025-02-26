# Permission required
```
chown -R 1000:000 esdata/ && chmod -R 770 esdata/
```

# First, Start only elastic container to create service token
```
docker compose up -d elasticsearch
# docker exec -it elasticsearch bin/elasticsearch-service-tokens create elastic/kibana default
curl -s -X POST -u elastic:your_elastic_password "http://localhost:9200/_security/service/elastic/kibana/credential/token/kibana-token"
```

Output of docker exec command will be like this:
```
{"created":true,"token":{"name":"kibana-token","value":"token_here"}}
```

# Update ELASTICSEARCH_SERVICEACCOUNTTOKEN in Kibana container. It's done!