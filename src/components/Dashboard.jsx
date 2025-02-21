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

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // ⚠️ No backend, so using mock data
                const mockData = [
                    { id: 1, name: "Alice", score: 100 },
                    { id: 2, name: "Bob", score: 95 },
                    { id: 3, name: "Charlie", score: 90 }
                ];

                console.warn("⚠️ No backend available. Using mock leaderboard data.");
                setLeaderboard(mockData);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="relative flex flex-col md:flex-row justify-between items-center min-h-screen gap-10 px-6">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0"></div>

            {/* Workout Section */}
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

            {/* Leaderboard Section */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm md:w-1/4">
                <h2 className="text-3xl font-bold text-white text-center mb-4 drop-shadow-lg">
                    Leaderboard 🏆
                </h2>
                <div className="bg-white/20 backdrop-blur-md shadow-lg border border-white/30 
                    rounded-xl p-6 w-full">
                    <ul className="text-white">
                        {leaderboard.length === 0 ? (
                            <p className="text-center text-lg">Loading...</p>
                        ) : (
                            leaderboard.map((user, index) => (
                                <li key={user.id} className="flex justify-between py-2 px-4 bg-white/10 rounded-lg mb-2">
                                    <span className="font-semibold">{index + 1}. {user.name}</span>
                                    <span className="font-bold">{user.score}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
