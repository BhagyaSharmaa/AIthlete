import { useEffect, useState } from "react";
import axios from "axios";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Home = () => {
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkoutPlans = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/workouts");
                console.log(response.data);  // Add this to log the response structure
                setWorkoutPlans(response.data);
            } catch (error) {
                console.error("Error fetching workout plans:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkoutPlans();
    }, []);

    return (
        <div className="flex flex-col px-6 py-12 bg-white/30 min-h-screen">
            <h1 className="text-4xl font-bold mb-4 text-white">AIthlete</h1>
            <p className="text-2xl text-white mb-4">This is the home page.</p>
            <p className="text-lg text-white mb-6">Click on the button below to take a look at the exercises</p>

            <SignedIn>
                <Link to="/dashboard" className="px-4 py-2 mb-8 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600">
                    Go to Exercises Dashboard
                </Link>
            </SignedIn>

            <SignedOut>
                <Link to="/sign-in" className="px-4 py-2 mb-8 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
                    Sign In to Continue
                </Link>
            </SignedOut>

            {/* Workout Plans Section */}
            <div>
                <h2 className="text-3xl font-semibold text-white mb-4">Workout Plans (Currently in Development)</h2>
                {loading ? (
                    <p className="text-white">Loading...</p>
                ) : workoutPlans.length === 0 ? (
                    <p className="text-white">No workout plans found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workoutPlans.map((plan) => (
                            <div key={plan._id} className="bg-red-300 border-white/30 p-4 rounded-xl backdrop-blur-md text-white">
                                <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                                <p className="mb-2">{plan.description}</p>
                                <ul className="list-disc list-inside text-sm">
                                    {plan.exercises.map((ex, idx) => (
                                        <li key={idx}>
                                            {ex.name} - {ex.sets} sets x {ex.reps} reps
                                        </li>
                                    ))}
                                </ul>
                                {/* Generate a URL-safe version of the title for the link */}
                                <Link
                                    to={`/workout/${encodeURIComponent(plan.title.toLowerCase().replace(/\s+/g, '-'))}`}
                                    className="block mt-4 text-center text-white bg-red-500 rounded-lg py-2"
                                >
                                    View Plan
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
