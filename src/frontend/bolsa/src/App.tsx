import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter} from "react-router-dom";
import {Route, Routes} from 'react-router-dom'
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import LogIn from './components/LogIn';
import { RequireAuthn } from './components/auth/RequireAuthn';
import { AuthnContainer } from './components/auth/Authn';
import Calendar from './components/Calendar';

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
      <AuthnContainer>
        <Routes>
          <Route path='/calendar' element={
            <Calendar/>
          }/>
          <Route path='/' element={
            <WelcomePage/>
          }/>
          <Route path='/log-in' element={
            <LogIn/>
          }/>
          <Route path='/dashboard/:userId' element={ // TODO: maybe, change path name
            <RequireAuthn children={
              <Dashboard/>
            }/>
          }/>
        </Routes>
      </AuthnContainer>
    </BrowserRouter>
  )
}

export default App;
