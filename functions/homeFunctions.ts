import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, auth } from 'firebaseConfig';
import { Alert } from 'react-native';

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
                    console.log(roomDoc.id);

                    if (roomDoc.exists()) {
                        return {
                            id: roomDoc.id,
                            ...(roomDoc.data() as object)
                        };
                    }
                    else {
                        return null;
                    }
                })
            );

            const rooms: Room[] = roomsData
                .map(room => ({
                    id: room.id,
                    name: room.name,
                    isAdmin: room.isAdmin
                }));

            return { rooms };
        }
    }
    catch (error) {
        console.error("Error fetching rooms: ", error);
    }

    return { rooms: [] };
};

export const leaveRoom = async ( roomId: string ): Promise<{ success: boolean; message: string }> => {
    console.log("leaveRoom in homeFunctions");
    const userId = auth.currentUser.uid;

    try {
        const userDocRef = doc(db, 'Users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const rooms = userDoc.data().rooms;
            for (let i = 0; i < rooms.length; i++) {
                console.log(rooms[i].path.slice(6));
                if (rooms[i].path.slice(6) === roomId) {
                    rooms.splice(i, i+1);
                    await updateDoc(userDocRef, { rooms });

                    return { success: true, message: 'Room removed from user document' };
                }
            }
        }
    } catch (e) {
        console.log(e);
        return { success: false, message: e.message };
    }

    return { success: false, message: '' };
  }