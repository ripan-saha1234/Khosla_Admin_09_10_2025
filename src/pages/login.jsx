import { useContext, useState } from 'react';
import { Context } from '../context/context';
import '../css/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(Context);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Static credentials - will be replaced with API call in future
    const STATIC_EMAIL = 'arijit.das@webprismits.com';
    const STATIC_PASSWORD = 'secure@1234';
    
    // future e API call korar jonno comment korchi
    // const response = await fetch('YOUR_API_ENDPOINT', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password })
    // });
    // const userData = await response.json();
    
    // Validate against static credentials
    if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
      // Mock user data - this will come from API in future
      const userData = {
        name: 'Arijit Das',
        email: email,
        role: 'super admin',
      };
      login(userData);
    } else {
      alert('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <h1>KHOSLA</h1>
          <h2>ELECTRONICS</h2>
        </div>
        
        <h3>Admin Panel Login</h3>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        
        <p className="login-note">
          Note: This is for authorized admin access only
        </p>
      </div>
    </div>
  );
}

export default Login;
