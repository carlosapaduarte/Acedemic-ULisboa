import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import WelcomePage from './components/WelcomePage';
import LogIn from './components/LogIn';
import {RequireAuthn} from './components/auth/RequireAuthn';
import {AuthnContainer} from './components/auth/Authn';
import {NotFoundPage} from "./Pages/NotFoundPage";
import AppDashboard from "./AppDashboard";
import Calendar from './components/Calendar';
import Dashboard from './components/Dashboard';
import { ErrorController } from './components/error/ErrorController';
import { ErrorContainer } from './components/error/ErrorContainer';
import { MyCalendar } from './components/MyCalendar';
import AvatarSelection from './components/Avatar';
import { GoalOverview } from './components/GoalOverview';

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
            <ErrorContainer>
                <AuthnContainer>
                    <AppDashboard>
                        <ErrorController>
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
                                <Route path='/goal-overview/:userId' element={ // TODO: maybe, change path name
                                    <GoalOverview onGoalClick={() => console.log()} />
                                }/>
                                <Route path="*" element={<NotFoundPage/>}/>
                            </Routes>
                        </ErrorController>
                    </AppDashboard>
                </AuthnContainer>
            </ErrorContainer>
        </BrowserRouter>
    )
}

export default App;
