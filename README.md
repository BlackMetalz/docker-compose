### Requirement 
- Current version: `27.5.0`
- Require docker compose plugin
```
apt install docker-compose-plugin -y
```
- If you prefer to keep using the hyphen syntax, you can create a symlink
```
sudo ln -s /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
```

### Access port in same host but not same docker compose
- Docker compose:
```
services:
  laravel:
    image: nginx:alpine
    container_name: my-container
    extra_hosts:
      - "host.docker.internal:host-gateway"
```
- Docker run: `docker run --add-host=host.docker.internal:host-gateway -d --name my-container nginx:alpine`