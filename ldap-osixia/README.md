# 1. Start containers
docker-compose -f docker-compose-test.yml up -d

# 2. Đợi 10 giây cho LDAP khởi động
sleep 10

# 3. Tạo users bằng 1 lệnh duy nhất
docker exec openldap bash -c "ldapadd -x -D 'cn=admin,dc=kienlt,dc=local' -w admin << 'EOF'
dn: ou=users,dc=kienlt,dc=local
objectClass: organizationalUnit
ou: users

dn: uid=kienlt,ou=users,dc=kienlt,dc=local
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: kienlt
cn: Kien LT
sn: LT
givenName: Kien
mail: kienlt@kienlt.local
userPassword: kienlt123
uidNumber: 10000
gidNumber: 10000
homeDirectory: /home/kienlt
loginShell: /bin/bash

dn: uid=user1,ou=users,dc=kienlt,dc=local
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: user1
cn: User One
sn: One
givenName: User
mail: user1@kienlt.local
userPassword: password1
uidNumber: 10001
gidNumber: 10000
homeDirectory: /home/user1
loginShell: /bin/bash

dn: uid=user2,ou=users,dc=kienlt,dc=local
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: user2
cn: User Two
sn: Two
givenName: User
mail: user2@kienlt.local
userPassword: password2
uidNumber: 10002
gidNumber: 10000
homeDirectory: /home/user2
loginShell: /bin/bash
EOF"

# 4. Restart ldap-auth-demo
docker restart ldap-auth-demo

# 5. Check logs
docker logs ldap-auth-demo -f