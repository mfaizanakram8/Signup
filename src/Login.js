import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if(data.error) {
        setMessage(data.error);
      } else {
        setMessage('Login successful! Redirecting...');
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to profile page after a short delay
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      }
    } catch (err) {
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='d-flex w-100 min-vh-100 bg-primary justify-content-center align-items-center'>
      <div className='bg-white p-4 rounded-3 shadow' style={{ maxWidth: '400px', width: '90%' }}>
        <h2 className='text-center mb-4'>Login</h2>
        {message && (
          <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label className='form-label'>Email address</label>
            <input
              type='email'
              className='form-control'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className='mb-3'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              className='form-control'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type='submit' 
            className='btn btn-primary w-100'
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className='text-center mt-3'>
          Don't have an account? <a href='/signup'>Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default Login;