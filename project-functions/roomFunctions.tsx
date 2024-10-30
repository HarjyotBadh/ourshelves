import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const notifyRoomUsers = async (roomId: string): Promise<{ success: boolean; message: string }> => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return { success: false, message: "No user is signed in" };
        }

        // Get room data to get the room name and user references
        const roomRef = doc(db, "Rooms", roomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
            return { success: false, message: "Room not found" };
        }

        const roomData = roomDoc.data();
        const roomName = roomData.name;

        // Get all users in the room
        const usersQuery = query(
            collection(db, "Users"),
            where("rooms", "array-contains", roomRef)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const notifications: Promise<any>[] = [];

        // Send notification to each user except the current user
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            if (userDoc.id !== currentUser.uid && userData.pushToken) {
                const message = {
                    to: userData.pushToken,
                    sound: 'default',
                    title: 'Room Bell',
                    body: `${currentUser.displayName} has rung the bell in ${roomName}!`,
                    data: { roomId: roomId },
                };

                notifications.push(
                    fetch('https://exp.host/--/api/v2/push/send', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(message),
                    })
                );
            }
        });

        await Promise.all(notifications);
        return { success: true, message: "Notifications sent successfully" };
    } catch (error) {
        console.error("Error sending notifications:", error);
        return { success: false, message: error.message };
    }
};
