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
  const Root = () => {
    return (
      <>
        <div>
          <Link to="/">Home</Link>
          <Link to="/quiz">Quiz</Link>
        </div>

        <div>
          <Outlet />
        </div>
      </>
    );
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="/quiz" element={<Quiz />}/>
      </Route>
    )
  );

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
