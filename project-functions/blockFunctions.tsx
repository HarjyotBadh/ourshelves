import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    arrayRemove,
} from "firebase/firestore";
import { db, auth } from "firebaseConfig";
import { ShelfData } from "../models/RoomData";

export const blockUser = async (blockedUserId: string): Promise<{ success: boolean; message: string }> => {
    const userId = auth.currentUser.uid;

    // add the blocked user to the user's blocked list
    try {
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // remove the blockedUserId from the user's "blockedUsers" list
            const blockedUsers = userDoc.data().blockedUsers;

            blockedUsers.push(doc(db, "Users", blockedUserId));
            await updateDoc(userDocRef, { blockedUsers });

            return { success: true, message: "User blocked" };
        }
    } catch (error) {
        console.error("Error with blockUser in blockFunctions.tsx: ", error);

        return { success: false, message: "Error blocking user" };
    }

    return { success: false, message: "" };

}

export const unblockUser = async (blockedUserId: string): Promise<{ success: boolean; message: string }> => {
    const userId = auth.currentUser.uid;

    // remove the blocked user from the user's blocked list
    try {
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // remove the blockedUserId from the user's "blockedUsers" list
            const blockedUsers = userDoc.data().blockedUsers;

            const newBlockedUsers = blockedUsers.filter((userRef: any) => userRef.id !== blockedUserId);
            await updateDoc(userDocRef, { blockedUsers: newBlockedUsers });

            return { success: true, message: "User unblocked" };
        }
    } catch (error) {
        console.error("Error with unblockUser in blockFunctions.tsx: ", error);

        return { success: false, message: "Error unblocking user" };
    }

    return { success: false, message: "" };
}

export const getBlockedUsers = async (): Promise<string[]> => {
    const userId = auth.currentUser.uid;

    try {
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const blockedUserRefs = userDoc.data().blockedUsers;
            const blockedUserIds = blockedUserRefs.map((userRef: any) => userRef.id);
            return blockedUserIds;
        }
    } catch (error) {
        console.error("Error with getBlockedUsers in blockFunctions.tsx: ", error);
    }

    return [];
}