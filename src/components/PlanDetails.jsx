import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const WorkoutPlanDetail = () => {
    const { id } = useParams(); // get plan ID from the URL
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/workouts/${id}`);
                setPlan(response.data);
            } catch (err) {
                console.error("Error fetching plan:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [id]);

    if (loading) return <p className="text-white p-4">Loading...</p>;
    if (!plan) return <p className="text-white p-4">Plan not found</p>;

    return (
        <div className="min-h-screen px-6 py-12 bg-white/30 text-white">
            <h1 className="text-4xl font-bold mb-4">{plan.title}</h1>
            <p className="text-xl mb-6">{plan.description}</p>
            <h2 className="text-2xl font-semibold mb-4">Exercises</h2>
            <ul className="list-disc list-inside space-y-2">
                {plan.exercises.map((ex, idx) => (
                    <li key={idx}>
                        <span className="font-semibold">{ex.name}</span> - {ex.sets} sets × {ex.reps} reps
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default WorkoutPlanDetail;
