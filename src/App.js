import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ThemeFab from './components/ThemeFab';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChooseRolePage from './pages/ChooseRolePage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import EmployerProfilePage from './pages/EmployerProfilePage';
import EmployerSettingsPage from './pages/EmployerSettingsPage';
import JobSeekerDashboardPage from './pages/JobSeekerDashboardPage';
import SeekerProfilePage from './pages/SeekerProfilePage';
import SeekerSettingsPage from './pages/SeekerSettingsPage';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/choose-role" element={<ChooseRolePage />} />
            <Route path="/employer-dashboard" element={<EmployerDashboardPage />} />
            <Route path="/employer/profile" element={<EmployerProfilePage />} />
            <Route path="/employer/settings" element={<EmployerSettingsPage />} />
            <Route path="/job-seeker-dashboard" element={<JobSeekerDashboardPage />} />
            <Route path="/job-seeker/profile" element={<SeekerProfilePage />} />
            <Route path="/job-seeker/settings" element={<SeekerSettingsPage />} />
          </Routes>
          <ThemeFab />
          </ToastProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
