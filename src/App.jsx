import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react"

function App() {
  return (
    <div className="App">
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <main className="p-4">
        <h1>Welcome to Your Vite React App with Clerk! 🎉</h1>
      </main>
    </div>
  );
}

export default App
