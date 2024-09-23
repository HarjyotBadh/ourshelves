import { lazy } from 'react';

const items = {
    'SoPRqkDt7BchhwihkqRN': lazy(() => import('./PlaceholderItem')),
    '9ngGTOJz71VI1gLMkGEe': lazy(() => import('./DogItem')),
    // Add new items here, for example:
    // '{ID of item from Firestore (in the Items collection) }': lazy(() => import('./{Name of file}')),
};

export default items;