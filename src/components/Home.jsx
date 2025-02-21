import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Flex It Out</h1>
            <p className="text-2xl text-gray-700 mb-6">This is the home page.</p>
            <p className="text-lg text-gray-700 mb-6">Click on the button below to do a workout</p>

            <SignedIn>
                <Link to="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600">
                    Go to Dashboard
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
