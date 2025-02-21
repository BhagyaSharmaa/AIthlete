// import React from "react";
import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-gray-700 mb-6">You`re signed in! 🎉</p>

            <UserButton />

            <Link to="/" className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600">
                Back to Home
            </Link>
        </div>
    );
};

export default Dashboard;
