
# Start containers
docker-compose -f docker-compose-test.yml up -d

# Wait for 30 seconds 

# Login with admin user
```
phpLDAPadmin: http://localhost:8080

Login DN: cn=admin,dc=kienlt,dc=local / Password: admin
```

# Login curl
```
curl -X POST http://localhost:3333/test-bind \
  -H "Content-Type: application/json" \
  -d '{"username":"kienlt","password":"kienlt123"}'
```

# Login direct:
- http://localhost:3333/