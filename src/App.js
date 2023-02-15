import React, { FC, createContext } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Link,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import {Home} from "./pages/Home";
import { Quiz} from "./pages/Quiz";

const App = () => {
  
  return (
    <div className="App">
      <Quiz />
    </div>
  );
};

export default App;
