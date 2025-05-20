import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const workouts = [
    { name: "Squats", image: "https://nutritionrealm.com/wp-content/uploads/2019/01/Squat-Form.jpg", path: "/workout/squats" },
    { name: "Push-ups", image: "https://th.bing.com/th/id/OIP.q0znWpm7fYLUiPuZ6lMsSAHaFj?rs=1&pid=ImgDetMain", path: "/workout/push-ups" },
    { name: "Pull-ups", image: "https://th.bing.com/th/id/OIP.zfW04xx5WAGh35-qblWpUQHaGa?rs=1&pid=ImgDetMain", path: "/workout/pull-ups" },
    { name: "Lunges", image: "https://th.bing.com/th/id/OIP.jku0H-xLrPgWhkbn2VauSQHaHY?rs=1&pid=ImgDetMain", path: "/workout/lunges" },
    { name: "Plank", image: "https://www.shape.com/thmb/T2GyvzFah3XYR8_L8W16ANWBTXs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/low-plank-hold-b8a63da1ef844f00b6f6a21141ba1d87.jpg", path: "/workout/plank" },
    { name: "Jumping Jack", image: "https://www.researchgate.net/profile/Mohammed-Abou-Elmagd/publication/341734848/figure/fig1/AS:896516470362114@1590757591713/Sample-of-Jumping-Jacks-Exercise-4.png", path: "/workout/jumpingjack" },
];

const Dashboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [pullupReps, setPullupReps] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("leaderboard");
        if (stored) {
            try {
                setLeaderboard(JSON.parse(stored));
            } catch (err) {
                console.error("Failed to parse leaderboard from localStorage:", err);
            }
        }

        const reps = localStorage.getItem("pullupReps");
        if (reps) {
            try {
                const parsedReps = JSON.parse(reps);
                // Map the data to include workout name if it exists
                const updatedReps = parsedReps.map(entry => {
                    if (!entry.workout) {
                        entry.workout = 'Unknown'; // Default to 'Unknown' if no workout name exists
                    }
                    return entry;
                });
                setPullupReps(updatedReps);
            } catch (err) {
                console.error("Failed to parse pullupReps from localStorage:", err);
            }
        }
    }, []);

    return (
        <div className="relative flex flex-col md:flex-row justify-between items-start min-h-screen gap-10 px-6 pt-10">
            <div className="absolute inset-0 bg-black/50 z-0"></div>

            <div className="relative z-10 flex flex-col items-center md:flex-1">
                <h1 className="text-6xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
                    Dashboard
                </h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-center w-full max-w-4xl">
                    {workouts.map((workout) => (
                        <Link
                            key={workout.name}
                            to={workout.path}
                            className="flex flex-col items-center bg-white/20 backdrop-blur-md 
                            shadow-lg rounded-xl p-4 transition-transform hover:scale-110 
                            hover:bg-white/30 duration-300 border border-white/30 w-36 h-36 sm:w-40 sm:h-40"
                        >
                            <img src={workout.image} alt={workout.name} className="w-20 h-20 sm:w-24 sm:h-24 mb-2" />
                            <p className="text-lg sm:text-xl font-semibold text-white drop-shadow-md">
                                {workout.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm md:w-1/4">
                <h2 className="text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
                    Leaderboard 🏆
                </h2>
                <div className="bg-white/20 backdrop-blur-md shadow-lg border border-white/30 
                    rounded-xl p-6 w-full">
                    <ul className="text-white">
                        {leaderboard.length === 0 ? (
                            <p className="text-center text-lg">(In development)</p>
                        ) : (
                            leaderboard.map((user, index) => (
                                <li key={index} className="flex justify-between py-2 px-4 bg-white/10 rounded-lg mb-2">
                                    <span className="font-semibold">{index + 1}. {user.name}</span>
                                    <span className="font-bold">{user.score}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            {/* Pull-up Reps */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm md:w-1/4">
                <h2 className="text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
                    Recent Activities 📈
                </h2>
                <div className="bg-white/20 backdrop-blur-md shadow-lg border border-white/30 
                    rounded-xl p-6 w-full max-h-96 overflow-y-auto">
                    {pullupReps.length === 0 ? (
                        <p className="text-center text-lg text-white">No pull-up data available.</p>
                    ) : (
                        <ul className="text-white">
                            {pullupReps.map((entry, index) => (
                                <li key={index} className="flex justify-between py-2 px-4 bg-white/10 rounded-lg mb-2">
                                    <span className="font-semibold">{new Date(entry.timestamp).toLocaleString()}</span>
                                    <span className="font-bold">{entry.reps} reps</span>
                                    <span className="text-sm font-medium pl-3 pr-4">{entry.workout}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                <Link
                    to="/home"
                    className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition duration-300"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
