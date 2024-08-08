import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import WelcomePage from './components/WelcomePage';
import Dashboard from './components/Dashboard';
import LogIn from './components/LogIn';
import {RequireAuthn} from './components/auth/RequireAuthn';
import {AuthnContainer} from './components/auth/Authn';
import {NotFoundPage} from "./Pages/NotFoundPage";
import AppDashboard from "./AppDashboard";
import Calendar from './components/Calendar';

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
                        <Route path='/calendar/:userId' element={ // TODO: maybe, change path name
                            <RequireAuthn children={
                                <Calendar/>
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
