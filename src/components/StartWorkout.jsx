import { useParams, Link } from "react-router-dom";

const StartWorkout = () => {
    const { workoutName } = useParams();

    return (
        <div className="text-center text-white min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Starting {workoutName} Workout</h1>
            <p className="text-lg mt-4">Get ready to begin your session!</p>
            <Link to={`/workout/${workoutName}`} className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg">
                Go Back
            </Link>
        </div>
    );
};

export default StartWorkout;
