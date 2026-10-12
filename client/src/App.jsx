import { useState } from "react";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <main className="app-shell">
      <div className="card">
        <div className="tabs" role="tablist" aria-label="Account access">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "login"}
            className="tab"
            onClick={() => setActiveTab("login")}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "signup"}
            className="tab"
            onClick={() => setActiveTab("signup")}
          >
            Sign up
          </button>
        </div>

        <div role="tabpanel">
          {activeTab === "signup" ? <Signup /> : <Login />}
        </div>
      </div>
    </main>
  );
}

export default App;