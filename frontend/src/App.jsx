import { ClerkProvider, clerkPubKey } from "./clerkAuth";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <AppRoutes />
      </Router>
    </ClerkProvider>
  );
}

export default App;
