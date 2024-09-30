import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, auth } from 'firebaseConfig';
import { Alert } from 'react-native';
import { SelectProvider } from 'tamagui';

interface Room {
    id: string;
    name: string;
    isAdmin: boolean;
    tags: string[];
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
                        
                        const tagRefs = (roomDoc.data() as { tags: any[] }).tags;
                        const tags = await Promise.all(
                            tagRefs.map(async (tagRef) => {
                                const tagDoc = await getDoc(tagRef);
                                return (tagDoc.data() as { name: string }).name;
                            })
                        ); 
                    
                        console.log(tags);
                        
                        return {
                            id: roomDoc.id,
                            name: (roomDoc.data() as Room).name,
                            isAdmin: isAdmin,
                            tags: tags,
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
                    isAdmin: room.isAdmin,
                    tags: room.tags,
                }));

            return { rooms };
        }
    }
    catch (error) {
        console.error("Error fetching rooms: ", error);
    }

    return { rooms: [] };
};

export const getTags = async (): Promise<{ tagNames: string[], tagIds: string[] }> => {
    try {
        const tagsCollection = collection(db, 'Tags');
        const tagsSnapshot = await getDocs(tagsCollection);

        const tagNames = tagsSnapshot.docs.map(doc => doc.data().name);
        const tagIds = tagsSnapshot.docs.map(doc => doc.id);
        const tags = tagsSnapshot.docs.map(doc => doc.data().name);
        return { tagNames, tagIds };
    } catch (error) {
        console.error("Error fetching tags: ", error);
        return { tagNames: [], tagIds: [] };
    }
}

export const getTagById = async (tagId: string): Promise<{ success: boolean, tag: string }> => {
    try {
        const tagDoc = await getDoc(doc(db, 'Tags', tagId));

        if (tagDoc.exists()) {
            return { success: true, tag: tagDoc.data().name };
        }
    }
    catch (error) {
        console.error("Error fetching tag: ", error);
    }

    return { success: false, tag: '' };
}

export const addTag = async (roomId: string, tagId: string): Promise<{ success: boolean; message: string }> => {
    try {
        const roomRef = doc(db, 'Rooms', roomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const tags = roomDoc.data().tags;
            tags.push(doc(db, 'Tags', tagId));

            await updateDoc(roomRef, { tags });

            return { success: true, message: 'Tag added to room' };
        }
    } catch (e) {
        console.log(e);
        return { success: false, message: e.message };
    }

    return { success: false, message: '' };
}

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
                    tags: roomDoc.data().tags,
                }
            };
        }
    }
    catch (error) {
        console.error("Error fetching room: ", error);
    }

    return { success: false, room: { id: '', name: '', isAdmin: false, tags: [] } };
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
                if (rooms[i].path.slice(6) === roomId) {

                    const roomRef = doc(db, 'Rooms', roomId);
                    const roomDoc = await getDoc(roomRef);
                    if (roomDoc.exists()) {
                        console.log(roomDoc.data().admins.length);
                        if (roomDoc.data().users.length === 1) {
                            return { success: false, message: 'Cannot leave a room with only one user in it (you).' };
                        }

                        rooms.splice(i, i + 1);
                        await updateDoc(userDocRef, { rooms });

                        const users = roomDoc.data().users;
                        const newUsers = users.filter((user: any) => user.path !== userDocRef.path);

                        const admins = roomDoc.data().admins;
                        const newAdmins = admins.filter((admin: any) => admin.path !== userDocRef.path);

                        await updateDoc(roomRef, { users: newUsers, admins: newAdmins });

                        return { success: true, message: 'Room removed from user document' };

                    }
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
                tags: [],
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


export const deleteRoom = async (roomId: string): Promise<{ success: boolean; message: string }> => {
    console.log("deleteRoom in homeFunctions");
    const userId = auth.currentUser.uid;

    try {
        const userDocRef = doc(db, 'Users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {

            const roomRef = doc(db, 'Rooms', roomId);
            const roomDoc = await getDoc(roomRef);

            if (roomDoc.exists()) {
                
                const shelfRefs = roomDoc.data().shelfList;

                shelfRefs.forEach(async (shelfRef: any) => {
                    const shelfDoc = await getDoc(shelfRef);
                    const itemRefs = (shelfDoc.data() as { itemList: any[] }).itemList;

                    itemRefs.forEach(async (itemRef: any) => {
                        console.log("delete item: " + itemRef.path);
                        await deleteDoc(itemRef);
                    });

                    console.log("delete shelf: " + shelfRef.path);
                    await deleteDoc(shelfRef);
                });

                
                console.log("delete room: " + roomRef.path);
                await deleteDoc(roomRef);
            }

            return { success: true, message: 'Room deleted.' };
        }
    } catch (e) {
        console.log(e);
        return { success: false, message: e.message };
    }

    return { success: false, message: 'Something went wrong in homeFunctions/deleteRoom. Yell at Jack' };
}