import { SignIn } from "@clerk/clerk-react";

function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
            card: "shadow-lg border border-gray-200 p-6",
          },
        }}
      />
    </div>
  );
}

export default SignInPage;
