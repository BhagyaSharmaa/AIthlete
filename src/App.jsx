import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp, UserButton } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
    throw new Error("Missing Clerk Publishable Key");
}

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
                <nav className="flex justify-between p-4 bg-gray-800 text-white relative z-10">
                    <h1 className="text-5xl font-bold">Flex It Out</h1>
                    <div>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                        <SignedOut>
                            <a href="/sign-in" className="mr-4 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition">
                                Login
                            </a>
                            <a href="/sign-up" className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-500 transition">
                                Create Account
                            </a>
                        </SignedOut>
                    </div>
                </nav>

                {/* Page Content Wrapper */}
                <div className="h-screen flex items-center">
                    <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Sign-In & Sign-Up Forms Positioned to the Right */}
                        <Route 
                            path="/sign-in" 
                            element={
                                <div className="absolute right-10 bg-white p-6 rounded-lg shadow-lg max-w-md">
                                    <SignIn />
                                </div>
                            } 
                        />
                        <Route 
                            path="/sign-up" 
                            element={
                                <div className="absolute right-10 bg-white p-6 rounded-lg shadow-lg max-w-md">
                                    <SignUp />
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
