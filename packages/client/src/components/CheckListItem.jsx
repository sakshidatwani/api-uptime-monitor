import React from 'react';
// highlight-start
// Import our new, specialized StatusIndicator component.
import StatusIndicator from './StatusIndicator';
// highlight-end

/**
 * Renders a single item in the check list.
 * @param {object} props - The component's props.
 * @param {object} props.check - The check object containing details like name, url, and status.
 */
function CheckListItem({ check, onDelete }) {
  const { name, url, status } = check;

   return (
    // We'll use a CSS class for styling the list item for better layout.
    // highlight-start
    <li className="check-list-item">
      <div className="check-info">
        <StatusIndicator status={status} />
        <strong>{name}</strong> - <span>{url}</span>
      </div>
      <div className="check-actions">
        {/* We will add an Edit button here in a future step */}
        <button onClick={() => onDelete(check._id)} className="btn-danger">
          Delete
        </button>
      </div>
    </li>
    // highlight-end
  );
}

export default CheckListItem;