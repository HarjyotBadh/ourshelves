import { lazy } from 'react';

const items = {
    'SoPRqkDt7BchhwihkqRN': lazy(() => import('./PlaceholderItem')),
    '9ngGTOJz71VI1gLMkGEe': lazy(() => import('./DogItem')),
    'di06JrCout6mTf3ppkCk': lazy(() => import('./WhiteboardItem')),
    'AoQjd9f8avPd2uqxrY6W': lazy(() => import('./PokeItem')),
    'VZGFAsog1SRzWcn2fPde': lazy(() => import('./PetRockItem')),
    'W1dcrJrzlxC8lZhhc8H3': lazy(() => import('./LetterboardItem')),
    'M1gqq2KIRmnbPN3mjCu7': lazy(() => import('./BellItem'))
    // Add new items here, for example:
    // '{ID of item from Firestore (in the Items collection) }': lazy(() => import('./{Name of file}')),
};

export default items;