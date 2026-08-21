function RecentComplaints() {
  const complaints = [
    {
      id: "CMP-55AD87",
      issue: "Damaged Product",
      status: "OPEN",
    },
    {
      id: "CMP-89KL22",
      issue: "Late Refund",
      status: "PENDING",
    },
  ];

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      <h3>Recent Complaints</h3>

      {complaints.map((c) => (
        <div
          key={c.id}
          style={{
            padding: "10px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <strong>{c.id}</strong>
          <p>{c.issue}</p>
          <span>{c.status}</span>
        </div>
      ))}
    </div>
  );
}

export default RecentComplaints;