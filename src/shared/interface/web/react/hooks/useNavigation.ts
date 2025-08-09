import { useNavigate } from 'react-router-dom';
import { buildRoute } from '../routes/routePaths';

export const useAppNavigation = () => {
    const navigate = useNavigate();

    const goToHome = () => navigate(buildRoute.home());
  
    const goToUser = () => {
        navigate(buildRoute.user());
    };

    const goToLogin = () => navigate(buildRoute.login());
    
    const goToRegister = () => navigate(buildRoute.register());

    return { 
        goToHome,
        goToUser,
        goToLogin,
        goToRegister
    };
}; 
