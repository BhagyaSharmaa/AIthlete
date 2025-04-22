import { useParams, Link} from "react-router-dom";

const workouts = [
    { 
        name: "Squats", 
        description: "A lower-body exercise that strengthens your legs and glutes.",
        gif: "https://www.verywellfit.com/thmb/-i6U4nnLmsBUIqs8SvuUyhEkMeM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/79--Sumo-SquatGIF-df6fd051e5c1451f93e6e5fa5b6b420f.gif", 
        path: "/workout/squats"
    },
    { 
        name: "Push-ups", 
        description: "An upper-body exercise that strengthens your chest, shoulders, and triceps.",
        gif: "https://d39ziaow49lrgk.cloudfront.net/wp-content/uploads/2016/03/Perfect_Push_Up.gif", 
        path: "/workout/push-ups",
        detector: "PushUpDetector"
    },
    { 
        name: "Pull-ups", 
        description: "A bodyweight exercise targeting back and arm muscles.",
        gif: "https://fitnessvolt.com/wp-content/uploads/2013/12/pull-up.gif", 
        path: "/workout/pull-ups"
    },
    { 
        name: "Lunges", 
        description: "A unilateral lower-body exercise that improves balance and strength.",
        gif: "https://i.pinimg.com/originals/9c/19/8c198f0c2f2b714d4f7e920bd4ac615e.gif", 
        path: "/workout/lunges"
    },
    { 
        name: "Plank", 
        description: "A core exercise that strengthens abdominal and back muscles.",
        gif: "https://www.shape.com/thmb/T2GyvzFah3XYR8_L8W16ANWBTXs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/low-plank-hold-b8a63da1ef844f00b6f6a21141ba1d87.jpg", 
        path: "/workout/plank"
    },
    { 
        name: "JumpingJack", 
        description: "A full-body cardio workout that improves stamina and coordination.",
        gif: "https://i.pinimg.com/originals/f3/0f/e9/f30fe940704b9f5e35ce56d4c2030c44.gif", 
        path: "/workout/jumpingjack",
        detector: "JumpingJacksDetector"
    }
];

const WorkoutDetail = () => {
    const { workoutName } = useParams();
    const workout = workouts.find(w => w.name.toLowerCase() === workoutName.toLowerCase());

    if (!workout) return <p className="text-center text-white text-xl mt-10">Workout not found.</p>;

    return (
        <div className="relative flex flex-col items-center text-center min-h-screen p-6">
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0"></div>

            <h1 className="text-5xl font-extrabold text-white mb-6 z-20">{workout.name}</h1>

            {/* Workout GIF */}
            <div className="relative z-20 flex flex-col items-center bg-white/20 backdrop-blur-md 
                shadow-lg rounded-xl p-6 border border-white/30 w-[90%] max-w-lg">
                <img src={workout.gif} alt={workout.name} className="w-48 h-48 sm:w-60 sm:h-60 mb-4 rounded-lg" />
            </div>

            {/* Workout Description */}
            <p className="text-xl text-white max-w-md mt-4 z-20">{workout.description}</p>

            {/* Buttons */}
            <div className="z-20 flex gap-6 mt-6">
                <Link to="/" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                    Go Back
                </Link>
                
                {/* Start Workout Button Now Appears for Every Workout */}
                <Link to={`/start-workout/${workoutName}`} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
                    Start Workout
                </Link>
            </div>
        </div>
    );
};

export default WorkoutDetail;
