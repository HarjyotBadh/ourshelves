import { getFirestore, doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
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

                    if (roomDoc.exists()) {
                        console.log(roomDoc.id);
                        const roomData = roomDoc.data() as { admins: { path: string }[] };
                        const isAdmin = roomData.admins.some((adminRef) => adminRef.path.includes(currentUserId));
                        console.log("here");
                        return {
                            id: roomDoc.id,
                            name: (roomDoc.data() as Room).name,
                            isAdmin: isAdmin,
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

export const getRoomById = async (roomId: string): Promise<{ success: boolean, room: Room }> => {
    try {
        const roomDoc = await getDoc(doc(db, 'Rooms', roomId));

        if (roomDoc.exists()) {
            return {
                success: true,
                room: {
                    id: roomDoc.id,
                    ...(roomDoc.data() as object),
                    name: roomDoc.data().name,
                    isAdmin: roomDoc.data().admins.includes(auth.currentUser.uid),
                }
            };
        }
    }
    catch (error) {
        console.error("Error fetching room: ", error);
    }

    return { success: false, room: {id: '', name: '', isAdmin: false} };
}

export const leaveRoom = async (roomId: string): Promise<{ success: boolean; message: string }> => {
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
                    
                    const roomRef = doc(db, 'Rooms', roomId);
                    const roomDoc = await getDoc(roomRef);
                    if (roomDoc.exists()) {
                        console.log(roomDoc.data().admins.length);
                        if (roomDoc.data().users.length === 1) {
                            return { success: false, message: 'Cannot leave a room with only one user in it (you).' };
                        }

                    }

                    return { success: false, message: 'Room NOT removed from user document' };


                    rooms.splice(i, i + 1);
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

export const createRoom = async (roomName: string, roomDescription: string): Promise<{ success: boolean; message: string }> => {
    console.log("createRoom in homeFunctions - " + roomName + " - " + roomDescription);
    const userId = auth.currentUser.uid;
    console.log(userId);
    
    try {
        const userDoc = await getDoc(doc(db, 'Users', userId));

        if (userDoc.exists()) {
            const userRef = doc(db, 'Users', userId);
            const roomRef = await addDoc(collection(db, 'Rooms'), {
                name: roomName,
                description: roomDescription,
                users: [userRef],
                admins: [userRef],
            });

            const userRooms = userDoc.data().rooms || [];
            userRooms.push(roomRef);

            await updateDoc(doc(db, 'Users', userId), {
                rooms: userRooms
            });

            return { success: true, message: `${roomRef.id}` };
        }
    } catch (e) {
        console.log(e);
        return { success: false, message: e.message };
    }

    return { success: false, message: 'nothing happened!' };
}