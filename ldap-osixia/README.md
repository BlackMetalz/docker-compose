
# Start containers
docker-compose up -d

# Wait for 30 seconds 

# Login with admin user
```
phpLDAPadmin: http://localhost:8080

Login DN: cn=admin,dc=kienlt,dc=local / Password: admin
```

# Ldapsearch
```
docker exec openldap ldapsearch -x -b "dc=kienlt,dc=local" -D "cn=admin,dc=kienlt,dc=local" -w admin
```

# Ldap account manager
✅ Đã thêm **LDAP Account Manager** (LAM)

**Truy cập:**
- **LDAP Account Manager**: http://localhost:8081

**Login LAM:**
1. Truy cập http://localhost:8081
2. Click "LAM configuration" → "Edit server profiles" 
3. Password: `lam` (default)
4. Cấu hình:
   - Server address: `ldap://openldap:389`
   - Tree suffix: `dc=kienlt,dc=local`
   - List of valid users: `cn=admin,dc=kienlt,dc=local`

Hoặc login trực tiếp với:
- Username: `cn=admin,dc=kienlt,dc=local`
- Password: `admin`

LAM có UI đẹp hơn và dễ quản lý users/groups hơn phpLDAPadmin nhiều! 🚀


# User demo info:

**Users:**
- `kienlt-dev1` (password: 123123) → group **developers**
- `kienlt-dev2` (password: 123123) → group **developers**
- `test.user` (password: 123123) → group **developers**
- `user1` (password: 123123) → group **users**
- `user2` (password: 123123) → group **users**
- `superadmin` (password: 123123) → group **admins**

**Groups:**
- **developers**: kienlt-dev1, kienlt-dev2, test.user
- **users**: user1, user2
- **admins**: superadmin