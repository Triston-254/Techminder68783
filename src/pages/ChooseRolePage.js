import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';

function ChooseRolePage() {
  const { page } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'seeker',
      icon: '💼',
      title: page.roleSeekerTitle,
      desc: page.roleSeekerDesc,
    },
    {
      id: 'employer',
      icon: '🏢',
      title: page.roleEmployerTitle,
      desc: page.roleEmployerDesc,
    },
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    sessionStorage.setItem('sjk_selected_role', selectedRole);
    navigate('/signup');
  };

  return (
    <AuthLayout title={page.roleTitle} subtitle={page.roleSubtitle}>
      <div className="row g-3 mb-4">
        {roles.map((role) => (
          <div className="col-md-6" key={role.id}>
            <button
              type="button"
              className={`role-card w-100 text-start p-4 rounded-4 border-0${selectedRole === role.id ? ' role-card-selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="role-card-icon mb-3">{role.icon}</div>
              <h3 className="h5 fw-bold mb-2">{role.title}</h3>
              <p className="text-muted small mb-0">{role.desc}</p>
              {selectedRole === role.id && <span className="role-check">✓</span>}
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-warning btn-lg w-100 auth-submit-btn rounded-pill fw-semibold"
        disabled={!selectedRole}
        onClick={handleContinue}
      >
        {page.roleContinue}
      </button>

      <p className="text-center text-muted mt-4 mb-0 auth-footer-text">
        {page.signupHasAccount}{' '}
        <Link to="/login" className="auth-link">{page.signupLoginLink}</Link>
      </p>
    </AuthLayout>
  );
}

export default ChooseRolePage;
