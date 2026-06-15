import DashboardHeader from './DashboardHeader';
import { EMPLOYER_ROUTES } from '../utils/dashboardRoutes';

function EmployerHeader(props) {
  return <DashboardHeader {...props} routes={EMPLOYER_ROUTES} />;
}

export default EmployerHeader;
