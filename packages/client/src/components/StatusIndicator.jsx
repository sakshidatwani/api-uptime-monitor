import React from 'react';

/**
 * A purely presentational component that displays a colored dot
 * based on the provided status.
 *
 * @param {object} props - The component's props.
 * @param {string} props.status - The status string ('up', 'down', 'paused').
 */
function StatusIndicator({ status }) {
  // We create a map to associate each status with a specific color.
  // This is a clean and scalable way to handle conditional styling.
  const statusColors = {
    up: '#4caf50',       // A pleasant green
    down: '#f44336',     // A clear red
    paused: '#9e9e9e',   // A neutral gray
  };

  // Define the style for our status dot.
  // In React, inline styles are provided as JavaScript objects.
  const indicatorStyle = {
    height: '10px',
    width: '10px',
    backgroundColor: statusColors[status] || statusColors.paused, // Default to gray if status is unknown
    borderRadius: '50%', // This makes our square a circle
    display: 'inline-block',
    marginRight: '8px', // Add some space between the dot and the text
  };

  return <span style={indicatorStyle}></span>;
}

export default StatusIndicator;