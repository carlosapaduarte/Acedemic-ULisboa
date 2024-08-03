import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter} from "react-router-dom";
import {Route, Routes} from 'react-router-dom'
import WelcomePage from './components/WelcomePage';
import ChooseLevel from './components/ChooseLevel';
import Calendar from './components/Calendar';
import LogIn from './components/LogIn';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Router/>
      </header>
    </div>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <WelcomePage/>
        }/>
        <Route path='/log-in' element={
          <LogIn/>
        }/>
        <Route path='/calendar' element={
          <Calendar/>
        }/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
