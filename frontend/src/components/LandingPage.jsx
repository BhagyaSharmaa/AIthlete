import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Flex It Out!</h1>
      <p className="text-lg text-gray-600 mb-6">Your fitness journey starts here.</p>
      <div>
        <Link to="/signin" className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Sign In
        </Link>
        <Link to="/signup" className="ml-4 px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
