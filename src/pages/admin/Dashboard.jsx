import '../../admin.css';

export default function Dashboard() {
  return (
    <div>
      <h1>Welcome to TBP Admin Dashboard</h1>
      <div className="admin-card" style={{ marginTop: '20px' }}>
        <p>Select a section from the sidebar to manage its content.</p>
        <p><strong>Note:</strong> Since each section has dynamic nested fields (like team members, faqs, etc.), the generic section editors allow you to edit the raw JSON structure of the entire section for now to support all complex operations. Ensure the JSON format matches the backend DTO requirements.</p>
      </div>
    </div>
  );
}
