import { useEffect, useState } from "react";

function CreateProject() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [projectLeadId, setProjectLeadId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:9000/api/users");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not retrieve users");
        }

        setUsers(data);
      } catch (error) {
        setUsersError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!name.trim() || !description.trim() || !projectLeadId) {
      setMessageType("error");
      setMessage("Please complete all project fields");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:9000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          status: status,
          project_lead_id: projectLeadId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessageType("error");
        setMessage(data.message || "Could not create project");
        return;
      }

      setMessageType("success");
      setMessage(data.message);
      setName("");
      setDescription("");
      setStatus("Planning");
      setProjectLeadId("");
    } catch {
      setMessageType("error");
      setMessage("Could not connect to the server. Please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Create Project</h2>

      {loading && <p>Loading registered users...</p>}

      {usersError && (
        <p className="status error">{usersError}</p>
      )}

      {!loading && !usersError && users.length === 0 && (
        <p>Register a user before creating a project.</p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Project Name</span>
          <input
            className="field-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Description</span>
          <textarea
            className="field-input"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Status</span>
          <select
            className="field-input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Project Lead</span>
          <select
            className="field-input"
            value={projectLeadId}
            onChange={(event) => setProjectLeadId(event.target.value)}
            disabled={loading || Boolean(usersError) || users.length === 0}
          >
            <option value="">Select a project lead</option>

            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
        </label>

        <button
          className="submit"
          type="submit"
          disabled={
            loading ||
            submitting ||
            Boolean(usersError) ||
            users.length === 0
          }
        >
          {submitting ? "Creating..." : "Create Project"}
        </button>
      </form>

      {message && (
        <p className={`status ${messageType}`} role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export default CreateProject;