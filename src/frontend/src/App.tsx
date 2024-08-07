import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AuthnContainer} from './components/auth/Authn';
import AppDashboard from "./AppDashboard";
import WelcomePage from "./components/WelcomePage";
import LogIn from "./components/LogIn";
import {RequireAuthn} from "./components/auth/RequireAuthn";
import {NotFoundPage} from "./Pages/NotFoundPage";
import Dashboard from "./components/Dashboard";

function App() {
    return (
        <div className="App">
            <div className="App-content">
                <Router/>
            </div>
        </div>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <AuthnContainer>
                <AppDashboard>
                    <Routes>
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
                        <Route path="*" element={<NotFoundPage/>}/>
                    </Routes>
                </AppDashboard>
            </AuthnContainer>
        </BrowserRouter>
    )
}

export default App;
