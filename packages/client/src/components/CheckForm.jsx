import React, { useState, useEffect } from 'react';

/**
 * A reusable form for creating and editing Checks.
 *
 * @param {object} props
 * @param {Function} props.onSubmit - A callback function to execute when the form is submitted.
 *                                    It receives the form data as an argument.
 * @param {Function} props.onClose - A callback function to close the container (e.g., a modal).
 * @param {object} [props.initialData] - Optional data to pre-populate the form for editing.
 */
function CheckForm({ onSubmit, onClose, initialData = {} }) {
  // --- State Management ---
  // We use the `initialData` prop to set the starting state. If `initialData` is provided,
  // the form is in 'edit' mode. Otherwise, it's in 'create' mode with default values.
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    url: initialData.url || '',
    protocol: initialData.protocol || 'HTTPS',
    path: initialData.path || '',
    port: initialData.port || '',
    timeout: initialData.timeout || 5, // Default timeout of 5 seconds
    interval: initialData.interval || 10, // Default interval of 10 minutes
  });

  // --- Event Handlers ---
  /**
   * A single, generic handler to update the form state.
   * This is a clean pattern to avoid creating a separate handler for each input.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  /**
   * Handles the form submission.
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onSubmit prop passed from the parent, providing the form's data.
    // The parent component (`DashboardPage`) will be responsible for the actual API call.
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="check-form">
      {/* Name Input */}
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* URL Input */}
      <div className="form-group">
        <label htmlFor="url">URL (e.g., google.com)</label>
        <input
          type="text"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
        />
      </div>

      {/* Protocol Select */}
      <div className="form-group">
        <label htmlFor="protocol">Protocol</label>
        <select
          id="protocol"
          name="protocol"
          value={formData.protocol}
          onChange={handleChange}
        >
          <option>HTTPS</option>
          <option>HTTP</option>
        </select>
      </div>

      {/* Optional fields can be grouped */}
      <details>
        <summary>Optional Settings</summary>
        <div className="optional-fields">
          <div className="form-group">
            <label htmlFor="path">Path (optional)</label>
            <input
              type="text"
              id="path"
              name="path"
              value={formData.path}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="port">Port (optional)</label>
            <input
              type="number"
              id="port"
              name="port"
              value={formData.port}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="timeout">Timeout (seconds)</label>
            <input
              type="number"
              id="timeout"
              name="timeout"
              min="1"
              value={formData.timeout}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="interval">Interval (minutes)</label>
            <input
              type="number"
              id="interval"
              name="interval"
              min="1"
              value={formData.interval}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </details>

      {/* Action Buttons */}
      <div className="form-actions">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save Check
        </button>
      </div>
    </form>
  );
}

export default CheckForm;