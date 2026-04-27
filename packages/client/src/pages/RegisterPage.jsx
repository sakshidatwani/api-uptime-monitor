// Import React and the useState hook for managing form state.
import React, { useState } from 'react';
// Import the useNavigate hook for programmatic navigation.
import { useNavigate } from 'react-router-dom';
// Import the authentication service we created.
import authService from '../services/authService';
// Import the zustand auth store we created.
import { useAuthStore } from '../store/authStore';

function RegisterPage() {
  // --- State Management ---
  // We use the useState hook to create state variables for each form field.
  // The initial value for each is an empty string.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // A state variable to hold any error messages from the API.
  const [error, setError] = useState('');

  // --- Hooks ---
  // The `login` action from our authStore. We'll call this after a successful registration.
  const loginAction = useAuthStore((state) => state.login);
  // The useNavigate hook gives us a function to redirect the user.
  const navigate = useNavigate();

  // --- Event Handler ---
  /**
   * Handles the form submission event.
   * This function is marked `async` because it will perform an asynchronous API call.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e) => {
    // Prevent the default browser behavior of refreshing the page on form submission.
    e.preventDefault();
    setError(''); // Clear any previous errors.

    try {
      // Step 1: Call the `register` function from our authService.
      // We pass the current state of our form fields to it.
      // We `await` the result, as this is an asynchronous network request.
      const userData = await authService.register(name, email, password);

      // Step 2: If registration is successful, log the user in.
      // Our backend's /register endpoint conveniently returns the user and a token,
      // so we can log them in immediately. We call the `login` action from our zustand store.
      // This will update the global state and save the user to localStorage.
      loginAction(userData);

      // Step 3: Redirect the user to their dashboard.
      // The `navigate` function changes the URL, and our router in App.js will render the DashboardPage.
      navigate('/dashboard');
    } catch (err) {
      // If an error occurs (e.g., network error, user already exists),
      // we'll get an error response from axios.
      // We set the error state to a user-friendly message.
      const errorMessage =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    }
  };

  return (
    <div>
      <h1>Create an Account</h1>
      {/* The form element's onSubmit event is tied to our handleSubmit function. */}
      <form onSubmit={handleSubmit}>
        {/* Each input is a "controlled component".
            - `value` is bound to the state variable.
            - `onChange` updates the state variable every time the user types.
        */}
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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

        {/* If there's an error, we display it to the user. */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;