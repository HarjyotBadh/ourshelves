import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'firebaseConfig';

interface Room {
    id: string;
    name: string;
    isAdmin: boolean;
}

export const getRooms = async (currentUserId: string): Promise<{ rooms: Room[] }> => {
    try {
        const userDoc = await getDoc(doc(db, 'Users', currentUserId));

        if (userDoc.exists()) {
            const roomRefs = userDoc.data().rooms;

            const roomsData = await Promise.all(
                roomRefs.map(async (roomRef) => {
                    const roomDoc = await getDoc(roomRef);
                    return roomDoc.exists() ? roomDoc.data() : null;
                })
            );

            const rooms: Room[] = roomsData
                .map(room => ({
                    id: "what",
                    name: room.name,
                    isAdmin: room.isAdmin
                }));

            return { rooms };
        }
    } catch (error) {
        console.error("Error fetching rooms: ", error);
    }

    return { rooms: [] };
};
