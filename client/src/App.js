import React, { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.scss";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Play from "./pages/Play";
import Courses from "./pages/Courses";
import Course from "./pages/Course";
// import Account from "./pages/Account";
import History from "./pages/History";

function App() {
  const [username, setUsername] = useState("");
  const [handicap, setHandicap] = useState("");

  useEffect(() => {
    const localUsername = () => {
      if (localStorage.getItem("username")) {
        setUsername(localStorage.getItem("username"));
        if (localStorage.getItem("handicap")) {
          setHandicap(localStorage.getItem("handicap"))
        }
      }
    };
    localUsername();
  }, []);

  const appLogin = (passUsername, rememberMe, playerHandicap) => {
    setUsername(passUsername);
    setHandicap(playerHandicap)
    if (passUsername && rememberMe) {
      // Sets username in localStorage if remember me is true
      localStorage.setItem("username", passUsername);
      if (playerHandicap) {
        localStorage.setItem("handicap", playerHandicap);
      }
    }
    // If the logout button is pressed, remove the item from localStorage and sessionStorage
    if (!passUsername) {
      localStorage.removeItem("username");
      localStorage.removeItem("handicap");
      sessionStorage.clear();
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar username={username} appLogin={appLogin} />
        <Switch>
          <Route
            path="/"
            exact
            render={(props) => (
              <Play {...props} appLogin={appLogin} username={username} />
            )}
          />
          <Route path="/about" exact component={About} />
          <Route path="/courses" exact component={Courses} />
          <Route path="/course/:cid" exact render={(props) => (
            <Course {...props} appLogin={appLogin} username={username} handicap={handicap} />
          )} /*component={Course}*/ />
          <Route
            path="/history"
            exact
            render={(props) => <History {...props} username={username} />}
          />
          {/* <Route path="/account" exact component={Account} /> */}
        </Switch>
      </div>
    </BrowserRouter>
  );
}

export default App;
