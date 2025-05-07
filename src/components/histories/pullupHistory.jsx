import { useEffect, useState } from "react";

const PullupHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("pullupReps");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Pull-up History</h2>
      {history.length === 0 ? (
        <p>No history available.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((entry, index) => (
            <li key={index} className="border-b pb-1">
              <strong>{new Date(entry.timestamp).toLocaleString()}</strong>: {entry.reps} reps
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PullupHistory;
