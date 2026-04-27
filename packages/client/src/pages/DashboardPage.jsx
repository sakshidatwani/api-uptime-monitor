import { useState, useEffect } from "react";
import checkService from "../services/checkServices";
import CheckList from "../components/CheckList";
import Modal from "../components/Modal";
import CheckForm from "../components/CheckForm";

function DashboardPage() {
  const [checks, setChecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [checkToDelete, setCheckToDelete] = useState(null);

  // --- Fetch Checks ---
  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const data = await checkService.getChecks();
        setChecks(data);
      } catch (err) {
        setError(err.message || "Failed to fetch checks.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChecks();
  }, []);

  // --- Create ---
  const handleCreateCheck = async (checkData) => {
    try {
      const newCheck = await checkService.createCheck(checkData);
      setChecks((prev) => [...prev, newCheck]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create check:", err);
      alert(err.response?.data?.message || "Could not create the check.");
    }
  };

  // --- Delete Modal Logic ---
  const handleOpenDeleteModal = (checkId) => {
    setCheckToDelete(checkId);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setCheckToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!checkToDelete) return; // Safety check

    try {
      // Use our checkService to send the DELETE request to the API.
      await checkService.deleteCheck(checkToDelete);

      // OPTIMISTIC UI UPDATE: Remove the check from the local state.
      // The .filter() method creates a new array containing only the elements
      // that pass the test, effectively removing the deleted check.
      setChecks((prevChecks) =>
        prevChecks.filter((check) => check._id !== checkToDelete)
      );

      // Close the modal and reset the state.
      handleCloseDeleteModal();
    } catch (err) {
      // In a real app, you'd show a more user-friendly error (e.g., a toast notification).
      console.error("Failed to delete check:", err);
      alert(err.response?.data?.message || "Could not delete the check.");
    }
  };
  // --- Render ---
  if (isLoading) return <div>Loading your checks...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Your Dashboard</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          Add New Check
        </button>
      </div>
      <p>Here you can view and manage all of your monitored endpoints.</p>

      <CheckList checks={checks} onDelete={handleOpenDeleteModal} />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <CheckForm
          onSubmit={handleCreateCheck}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
        <h2>Confirm Deletion</h2>
        <p>
          Are you sure you want to delete this check? This action cannot be
          undone.
        </p>
        <div className="form-actions">
          <button onClick={handleCloseDeleteModal} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirmDelete} className="btn-danger">
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default DashboardPage;
