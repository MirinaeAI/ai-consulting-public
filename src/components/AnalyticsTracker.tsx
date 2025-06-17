import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // 현재 페이지 경로로 페이지뷰 전송
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }, [location]);

    return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
};

export default AnalyticsTracker; 