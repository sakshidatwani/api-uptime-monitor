import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuthStore } from '../store/authStore';

function LoginPage() {
  // State for email, password, and any login errors.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get the login action from our zustand store.
  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  /**
   * Handles the login form submission.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors.

    try {
      // Step 1: Call the `login` function from our authService.
      const userData = await authService.login(email, password);

      // Step 2: Call the `login` action from our store to save the session.
      // This is the single action that updates our global state and localStorage.
      loginAction(userData);

      // Step 3: Redirect to the dashboard.
      navigate('/dashboard');
    } catch (err) {
      // Handle login errors (e.g., invalid credentials).
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
