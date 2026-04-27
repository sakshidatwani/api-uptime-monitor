// Step 1: Import all the necessary tools and components.
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Import the page components you created in the previous step.
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from '../src/components/PrivateRoute';
// We can also import our CSS file here.
import './App.css';

// The App component now becomes the central hub for routing.
function App() {
  return (
    // The BrowserRouter component wraps your entire application.
    // This makes the routing functionality available to all child components.
    <BrowserRouter>
      <div>
        {/* We'll create a simple navigation bar to test our routes. */}
        {/* The 'Link' component is used instead of an 'a' tag to prevent full page reloads. */}
        <header>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          {/* The Routes component is a container for all your individual Route definitions. */}
          {/* It will render the component of the first Route that matches the current URL. */}
          <Routes>
            {/* 
              Each Route component defines a mapping between a URL path and a React component.
              - `path`: The URL path to match. The path "/" is for the root or home page.
              - `element`: The React component to render when the path matches. Note the JSX syntax: `{<HomePage />}`
            */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
              <DashboardPage />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;