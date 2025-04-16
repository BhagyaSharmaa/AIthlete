import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
  RedirectToSignIn,
} from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import WorkoutDetail from "./components/WorkoutDetail";
import Squats from "./components/exercises/SquatDetector";
import PushUps from "./components/exercises/PushUpDetector";
import PullUps from "./components/exercises/PullUpDetector";
import Lunges from "./components/exercises/LungesDetector";
import JumpingJack from "./components/exercises/JumpingJacksDetector";
// import PoseTracker from "./components/PoseTracker"; // ✅ Import PoseTracker

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

// Map workout names to their respective components
const workoutComponents = {
  squats: Squats,
  "push-ups": PushUps,
  "pull-ups": PullUps,
  lunges: Lunges,
  jumpingjack: JumpingJack,
};

// Dynamic workout rendering component
const StartWorkout = () => {
  const { workoutName } = useParams();
  const WorkoutComponent = workoutComponents[workoutName.toLowerCase()];

  if (!WorkoutComponent) {
    return <p className="text-center text-white text-xl mt-10">Workout not found.</p>;
  }

  return <WorkoutComponent />;
};

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        {/* Full-Screen Background Video */}
        <div className="absolute inset-0 -z-10">
          <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover">
            <source src="/4761426-uhd_4096_2160_25fps.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Navigation Bar */}
        <nav className="flex justify-between p-4 bg-red-900 text-white relative z-10">
          <h1 className="text-5xl font-bold">AIthlete</h1>
          <div>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <a href="/sign-in" className="mr-4 px-4 py-2 bg-amber-400 rounded-lg text-white hover:bg-blue-500 transition">
                Login
              </a>
              <a href="/sign-up" className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-500 transition">
                Create Account
              </a>
            </SignedOut>
          </div>
        </nav>

        {/* Page Content */}
        <div className="h-screen flex items-center">
          <Routes>
            {/* Redirect "/" to "/home" when signed in, otherwise to "/sign-in" */}
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <Navigate to="/home" replace />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            {/* Home, Dashboard, and Workout Detail Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout/:workoutName" element={<WorkoutDetail />} />

            {/* ✅ Route for dynamically rendering the correct workout component */}
            <Route path="/start-workout/:workoutName" element={<StartWorkout />} />

            {/* ✅ Route for Pose Tracker */}
            {/* <Route path="/pose-tracker" element={<PoseTracker />} /> */}

            {/* Redirect Sign-In and Sign-Up to "/home" after authentication */}
            <Route
              path="/sign-in"
              element={
                <div className="flex justify-center items-center h-screen">
                  <SignIn afterSignInUrl="/home" />
                </div>
              }
            />
            <Route
              path="/sign-up"
              element={
                <div className="flex justify-center items-center h-screen">
                  <SignUp afterSignUpUrl="/home" />
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
