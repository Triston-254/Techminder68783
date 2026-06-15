import DashboardHeader from './DashboardHeader';
import { SEEKER_ROUTES } from '../utils/dashboardRoutes';

function SeekerHeader(props) {
  return <DashboardHeader {...props} routes={SEEKER_ROUTES} />;
}

export default SeekerHeader;
