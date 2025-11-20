const express = require('express');
const ldap = require('ldapjs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LDAP configuration
const LDAP_CONFIG = {
  url: 'ldap://openldap:389',
  timeout: 10000,
  connectTimeout: 10000
};

// Serve login page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>LDAP Login Demo</title>
    </head>
    <body>
      <h2>LDAP Login</h2>
      <form id="loginForm">
        <input type="text" id="username" name="username" placeholder="Username" required>
        <input type="password" id="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div id="message"></div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const messageDiv = document.getElementById('message');

          messageDiv.textContent = 'Authenticating...';

          try {
            const response = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (result.success) {
              messageDiv.innerHTML = '✅ Login successful!<br>User: ' + result.user.cn;
            } else {
              messageDiv.textContent = '❌ ' + result.message;
            }
          } catch (error) {
            messageDiv.textContent = '❌ Connection error';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Direct bind without search
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password required' });
  }

  console.log('Login attempt:', username);

  // Build DN directly from username
  const userDN = `uid=${username},ou=users,dc=kienlt,dc=local`;
  console.log('Attempting bind with DN:', userDN);

  const client = ldap.createClient(LDAP_CONFIG);

  client.bind(userDN, password, (bindErr) => {
    if (bindErr) {
      console.error('Bind error:', bindErr.message);
      client.unbind();
      return res.json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    console.log('Bind successful for:', userDN);
    
    // Now search for user info
    const searchOptions = {
      scope: 'base',
      attributes: ['cn', 'mail', 'uid']
    };

    client.search(userDN, searchOptions, (searchErr, searchRes) => {
      if (searchErr) {
        console.error('Search error:', searchErr.message);
        client.unbind();
        return res.json({ 
          success: false, 
          message: 'Error retrieving user info' 
        });
      }

      let userInfo = null;

      searchRes.on('searchEntry', (entry) => {
        userInfo = {
          cn: entry.attributes.find(attr => attr.type === 'cn')?.values[0] || username,
          mail: entry.attributes.find(attr => attr.type === 'mail')?.values[0] || 'N/A',
          uid: entry.attributes.find(attr => attr.type === 'uid')?.values[0] || username
        };
      });

      searchRes.on('error', (err) => {
        console.error('Search result error:', err.message);
      });

      searchRes.on('end', () => {
        client.unbind();
        
        if (!userInfo) {
          userInfo = { cn: username, mail: 'N/A', uid: username };
        }

        res.json({ 
          success: true, 
          message: 'Login successful',
          user: userInfo
        });
      });
    });
  });

  client.on('error', (err) => {
    console.error('LDAP client error:', err.message);
  });
});

// Test direct bind endpoint
app.post('/test-bind', (req, res) => {
  const { username, password } = req.body;

  const userDN = `uid=${username},ou=users,dc=kienlt,dc=local`;
  console.log('Test bind with:', userDN);

  const client = ldap.createClient(LDAP_CONFIG);

  client.bind(userDN, password, (err) => {
    if (err) {
      console.error('Test bind error:', err.message);
      client.unbind();
      return res.json({ success: false, message: err.message });
    }

    console.log('Test bind successful');
    client.unbind();
    res.json({ success: true, message: 'Bind successful' });
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('LDAP Auth Demo running on http://localhost:3000');
});