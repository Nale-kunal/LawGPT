const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing registration...');
    
    // Test registration
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
        role: 'lawyer'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
      
      // Test login with the same credentials
      console.log('\nTesting login...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      
      if (loginResponse.ok) {
        console.log('✅ Login successful!');
      } else {
        console.log('❌ Login failed:', loginData.error);
      }
    } else {
      console.log('❌ Registration failed:', registerData.error);
      
      // If registration failed because user exists, try login
      if (registerData.error === 'Email already registered') {
        console.log('\nTrying login with existing user...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'testpass123'
          })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (loginResponse.ok) {
          console.log('✅ Login successful!');
        } else {
          console.log('❌ Login failed:', loginData.error);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();
