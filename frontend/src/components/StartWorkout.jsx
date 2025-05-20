import React, { useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const StartWorkout = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    exercises: [{ name: "", sets: 0, reps: 0 }],
  });

  const handleChange = (index, e) => {
    const updated = [...formData.exercises];
    updated[index][e.target.name] = e.target.value;
    setFormData({ ...formData, exercises: updated });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: "", sets: 0, reps: 0 }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/workouts", {
        ...formData,
        userId: user.id,
      });
      alert("Workout saved!");
    } catch (err) {
      console.error("Failed to save workout", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <input
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      {formData.exercises.map((ex, idx) => (
        <div key={idx}>
          <input
            name="name"
            placeholder="Exercise Name"
            value={ex.name}
            onChange={(e) => handleChange(idx, e)}
          />
          <input
            name="sets"
            placeholder="Sets"
            type="number"
            value={ex.sets}
            onChange={(e) => handleChange(idx, e)}
          />
          <input
            name="reps"
            placeholder="Reps"
            type="number"
            value={ex.reps}
            onChange={(e) => handleChange(idx, e)}
          />
        </div>
      ))}
      <button type="button" onClick={addExercise}>+ Add Exercise</button>
      <button type="submit">Submit Workout</button>
    </form>
  );
};

export default StartWorkout;
