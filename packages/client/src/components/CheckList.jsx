// highlight-start
// Import the new, more specific CheckListItem component.
import CheckListItem from "./CheckListItem";
// highlight-end

/**
 * A "presentational" component responsible for rendering a list of checks.
 * It receives the checks array as a prop and doesn't manage its own state.
 *
 * @param {object} props - The component's props.
 * @param {Array} props.checks - An array of check objects to display.
 */
function CheckList({ checks, onDelete }) {
  if (checks.length === 0) {
    return <p>You have not created any checks yet. Add one to get started!</p>;
  }

  return (
    <ul>
      {/* 
        This is the core of the refactor. Instead of rendering an <li> directly,
        our map function now renders an instance of our CheckListItem component
        for each check in the array.
      */}
      {/* highlight-start */}
      {checks.map((check) => (
        // We pass the entire 'check' object down as a prop.
        // VERY IMPORTANT: The `key` prop MUST go here, on the top-level
        // component being returned from the map. React needs this key to
        // efficiently manage the list of CheckListItem components.
        <CheckListItem key={check._id} check={check} onDelete={onDelete} />
      ))}
      {/* highlight-end */}
    </ul>
  );
}

export default CheckList;
