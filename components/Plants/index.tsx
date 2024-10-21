import { lazy } from 'react';

const plants = {
    'sunflower': lazy(() => import('./SunflowerPlant')),
};

export default plants;