import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import TaskForm from "../components/TaskForm.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch tasks";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (payload) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.post("/tasks", payload);
      setTasks((prev) => [data.data, ...prev]);
      setMessage(data.message || "Task created");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create task";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({ title: task.title, description: task.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "" });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = async (taskId) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.put(`/tasks/${taskId}`, editForm);
      setTasks((prev) => prev.map((item) => (item._id === taskId ? data.data : item)));
      setMessage(data.message || "Task updated");
      cancelEdit();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update task";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (task) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((item) => (item._id === task._id ? data.data : item)));
      setMessage(data.message || "Task updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update task";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((item) => item._id !== taskId));
      setMessage(data.message || "Task deleted");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete task";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="page">
      <div className="card wide">
        <div className="header-row">
          <div>
            <h1>Dashboard</h1>
            <p className="muted">
              {user ? `Signed in as ${user.name} (${user.role})` : "Tasks"}
            </p>
          </div>
          <button className="secondary" onClick={logout}>
            Logout
          </button>
        </div>

        <TaskForm onSubmit={handleCreate} loading={saving} />

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="task-list">
          {loading ? (
            <p className="muted">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="muted">No tasks yet. Create your first one.</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={task.completed ? "task done" : "task"}>
                {editingId === task._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                    />
                    <textarea
                      name="description"
                      rows="2"
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                    <div className="task-actions">
                      <button onClick={() => saveEdit(task._id)} disabled={saving}>
                        Save
                      </button>
                      <button className="secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="task-content">
                    <div>
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <div className="task-actions">
                      <button onClick={() => toggleComplete(task)} disabled={saving}>
                        {task.completed ? "Mark active" : "Complete"}
                      </button>
                      <button className="secondary" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                      <button className="danger" onClick={() => deleteTask(task._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
