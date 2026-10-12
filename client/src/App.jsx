import { useState } from "react";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import CreateProject from "./components/CreateProject.jsx";
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
          <button
             type="button"
            role="tab"
            aria-selected={activeTab === "createProject"}
            className="tab"
            onClick={() => setActiveTab("createProject")}
          >
            Create Project
        </button> 
        </div>

        <div role="tabpanel">
  {activeTab === "signup" && <Signup />}
  {activeTab === "login" && <Login />}
  {activeTab === "createProject" && <CreateProject />}
</div>
      </div>
    </main>
  );
}

export default App;