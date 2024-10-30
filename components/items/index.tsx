import { lazy } from 'react';

const items = {
    'SoPRqkDt7BchhwihkqRN': lazy(() => import('./PlaceholderItem')),
    '9ngGTOJz71VI1gLMkGEe': lazy(() => import('./DogItem')),
    'di06JrCout6mTf3ppkCk': lazy(() => import('./WhiteboardItem')),
    'AoQjd9f8avPd2uqxrY6W': lazy(() => import('./PokeItem')),
    'VZGFAsog1SRzWcn2fPde': lazy(() => import('./PetRockItem')),
    'r0bLQwyspeXIKE5d6fzg': lazy(() => import('./PlantItem')),
    'qWoaz1vNrtW9If87Tq8l': lazy(() => import('./ClockItem')),
    'vyvdVS3vtZhzv5oqhmY4': lazy(() => import('./LinkItem')),
    'WN3gKAlxR2ImFMGh4Iop': lazy(() => import('./NoteBoxItem')),
    '3u3CsWfAQUXUxSBFqJ1u': lazy(() => import('./VotingBoxItem')),
    // Add new items here, for example:
    // '{ID of item from Firestore (in the Items collection) }': lazy(() => import('./{Name of file}')),
};

export default items;