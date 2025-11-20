#!/bin/bash

# Tạo passwords hash
PASS_KIENLT=$(docker exec openldap slappasswd -s kienlt123)
PASS_USER1=$(docker exec openldap slappasswd -s password1)  
PASS_USER2=$(docker exec openldap slappasswd -s password2)

docker exec openldap bash -c "ldapadd -x -D 'cn=admin,dc=kienlt,dc=local' -w admin << EOF
dn: ou=users,dc=kienlt,dc=local
objectClass: organizationalUnit
ou: users

dn: ou=groups,dc=kienlt,dc=local
objectClass: organizationalUnit
ou: groups

dn: cn=users,ou=groups,dc=kienlt,dc=local
objectClass: posixGroup
cn: users
gidNumber: 10000

dn: uid=kienlt,ou=users,dc=kienlt,dc=local
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
uid: kienlt
cn: Kien LT
sn: LT
givenName: Kien
mail: kienlt@kienlt.local
userPassword: $PASS_KIENLT
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
userPassword: $PASS_USER1
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
userPassword: $PASS_USER2
uidNumber: 10002
gidNumber: 10000
homeDirectory: /home/user2
loginShell: /bin/bash
EOF"

# Thêm users vào group
docker exec openldap bash -c "ldapmodify -x -D 'cn=admin,dc=kienlt,dc=local' -w admin << EOF
dn: cn=users,ou=groups,dc=kienlt,dc=local
changetype: modify
add: memberUid
memberUid: kienlt
memberUid: user1
memberUid: user2
EOF"