import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import InstagramConfirmation from './components/instagram/InstagramConfirmation'; // Instagram page
import HCaptchaPage from './components/hcaptcha';
import './App.css';
import Sessions from './components/sessions/Sessions';
function App() {
    return (
        <Router>
            <Routes>
                {/* Default Instagram page route */}
                <Route path="/" element={<InstagramConfirmation />} />

                <Route path="/auth" element={<HCaptchaPage />} />
             
                <Route path="/sessions" element={<Sessions />} />
            </Routes>
        </Router>
    );
}

export default App;
