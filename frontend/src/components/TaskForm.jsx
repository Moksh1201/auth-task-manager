import { useState } from "react";

const TaskForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({ title: "", description: "" });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    onSubmit({ title: form.title.trim(), description: form.description.trim() });
    setForm({ title: "", description: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <label>
        Title
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={onChange}
          required
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          rows="3"
          value={form.description}
          onChange={onChange}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add task"}
      </button>
    </form>
  );
};

export default TaskForm;
