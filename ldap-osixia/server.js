const express = require('express');
const ldap = require('ldapjs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve login page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>LDAP Login Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .login-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          width: 300px;
        }
        h2 {
          margin-top: 0;
          color: #333;
          text-align: center;
        }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }
        button:hover {
          background: #5568d3;
        }
        .message {
          margin-top: 15px;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
        }
        .success {
          background: #d4edda;
          color: #155724;
        }
        .error {
          background: #f8d7da;
          color: #721c24;
        }
        .info {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 5px;
          font-size: 14px;
        }
        .info h3 {
          margin-top: 0;
          color: #667eea;
        }
        .user-list {
          list-style: none;
          padding: 0;
        }
        .user-list li {
          padding: 5px 0;
          border-bottom: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="login-box">
        <h2>🔐 LDAP Login Demo</h2>
        <form id="loginForm">
          <input type="text" id="username" name="username" placeholder="Username" required>
          <input type="password" id="password" name="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
        <div id="message"></div>
        
        <div class="info">
          <h3>Test Accounts:</h3>
          <ul class="user-list">
            <li><strong>kienlt</strong> / kienlt123</li>
            <li><strong>user1</strong> / password1</li>
            <li><strong>user2</strong> / password2</li>
          </ul>
        </div>
      </div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const messageDiv = document.getElementById('message');

          messageDiv.textContent = 'Authenticating...';
          messageDiv.className = 'message';

          try {
            const response = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (result.success) {
              messageDiv.className = 'message success';
              messageDiv.innerHTML = '✅ Login successful!<br>User: ' + result.user.cn + '<br>Email: ' + result.user.mail;
            } else {
              messageDiv.className = 'message error';
              messageDiv.textContent = '❌ ' + result.message;
            }
          } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ Connection error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Handle login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password required' });
  }

  const client = ldap.createClient({
    url: 'ldap://openldap:389',
    timeout: 5000,
    connectTimeout: 5000
  });

  // Build user DN from username
  const userDN = `uid=${username},ou=users,dc=kienlt,dc=local`;

  client.bind(userDN, password, (err) => {
    if (err) {
      console.error('Bind error:', err.message);
      client.unbind();
      return res.json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    console.log('Bind successful for:', userDN);

    // Get user info
    const searchOptions = {
      scope: 'base',
      attributes: ['cn', 'mail', 'uid', 'givenName', 'sn']
    };

    client.search(userDN, searchOptions, (err, searchRes) => {
      if (err) {
        console.error('Search error:', err.message);
        client.unbind();
        return res.json({ 
          success: false, 
          message: 'Error retrieving user information' 
        });
      }

      let userInfo = null;

      searchRes.on('searchEntry', (entry) => {
        userInfo = entry.object;
        console.log('User found:', userInfo);
      });

      searchRes.on('error', (err) => {
        console.error('Search error event:', err.message);
        client.unbind();
        return res.json({ 
          success: false, 
          message: 'Error during search' 
        });
      });

      searchRes.on('end', (result) => {
        client.unbind();
        
        if (!userInfo) {
          console.error('No user info found');
          return res.json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        res.json({ 
          success: true, 
          message: 'Login successful',
          user: {
            cn: userInfo.cn || username,
            mail: userInfo.mail || 'N/A',
            uid: userInfo.uid || username
          }
        });
      });
    });
  });

  // Handle connection errors
  client.on('error', (err) => {
    console.error('LDAP client error:', err.message);
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log('LDAP Auth Demo running on http://localhost:3000');
  console.log('Connecting to LDAP server at ldap://openldap:389');
});