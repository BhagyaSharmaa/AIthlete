import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flex flex-col items-start justify-start px-6 py-12 bg-white/30 min-h-screen">
            <h1 className="text-4xl font-bold mb-4">AIthlete</h1>
            <p className="text-2xl text-white mb-4">This is the home page.</p>
            <p className="text-lg text-white mb-6">Click on the button below to take a look at the exercises</p>

            <SignedIn>
                <Link to="/dashboard" className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-700">
                    Go to Exercises Dashboard
                </Link>
            </SignedIn>

            <SignedOut>
                <Link to="/sign-in" className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
                    Sign In to Continue
                </Link>
            </SignedOut>
        </div>
    );
};

export default Home;
