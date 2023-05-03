import React from "react";
import UserPage from "./Components/UserPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import AdminPage from "./Components/AdminPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" index element={<UserPage />}></Route>
        <Route path="/admin" element={<AdminPage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
