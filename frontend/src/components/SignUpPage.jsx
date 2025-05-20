import { SignUp } from "@clerk/clerk-react";

function SignUpPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded",
            card: "shadow-lg border border-gray-200 p-6",
          },
        }}
      />
    </div>
  );
}

export default SignUpPage;
