import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "firebaseConfig";
import { ShelfData } from "../models/RoomData";

interface Room {
  id: string;
  name: string;
  isAdmin: boolean;
  tags: string[];
  isPublic: boolean;
}

export const getRooms = async (currentUserId: string): Promise<{ rooms: Room[] }> => {
  try {
    const userDoc = await getDoc(doc(db, "Users", currentUserId));

    if (userDoc.exists()) {
      const roomRefs = userDoc.data().rooms;

      const roomsData = await Promise.all(
        roomRefs.map(async (roomRef) => {
          const roomDoc = await getDoc(roomRef);

          if (roomDoc.exists()) {
            const roomData = roomDoc.data() as { admins: { path: string }[], isPublic: boolean, tags: any[] };
            const isAdmin = roomData.admins.some((adminRef) =>
              adminRef.path.includes(currentUserId)
            );

            const tags = await Promise.all(
              roomData.tags.map(async (tagRef) => {
                const tagDoc = await getDoc(tagRef);
                return (tagDoc.data() as { name: string }).name;
              })
            );

            return {
              id: roomDoc.id,
              name:(roomDoc.data() as Room).name,
              isAdmin: isAdmin,
              tags: tags,
              isPublic: roomData.isPublic,
            };
          } else {
            return null;
          }
        })
      );

      const rooms: Room[] = roomsData.filter((room) => room !== null);

      return { rooms };
    }
  } catch (error) {
    console.error("Error fetching rooms: ", error);
  }

  return { rooms: [] };
};


export const getTags = async (): Promise<{ tagNames: string[]; tagIds: string[] }> => {
  try {
    const tagsCollection = collection(db, "Tags");
    const tagsSnapshot = await getDocs(tagsCollection);

    const tagNames = tagsSnapshot.docs.map((doc) => doc.data().name);
    const tagIds = tagsSnapshot.docs.map((doc) => doc.id);
    return { tagNames, tagIds };
  } catch (error) {
    console.error("Error fetching tags: ", error);
    return { tagNames: [], tagIds: [] };
  }
};

export const getTagById = async (tagId: string): Promise<{ success: boolean; tag: string }> => {
  try {
    const tagDoc = await getDoc(doc(db, "Tags", tagId));

    if (tagDoc.exists()) {
      return { success: true, tag: tagDoc.data().name };
    }
  } catch (error) {
    console.error("Error fetching tag: ", error);
  }

  return { success: false, tag: "" };
};

export const getUserById = async (userId: string): Promise<{ success: boolean; user: string }> => {
  try {
    const userDoc = await getDoc(doc(db, "Users", userId));

    if (userDoc.exists()) {
      return { success: true, user: userDoc.data().displayName };
    }
  } catch (error) {
    console.error("Error fetching tag: ", error);
  }

  return { success: false, user: "" };
};

export const addTag = async (
  roomId: string,
  tagId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const roomRef = doc(db, "Rooms", roomId);
    const roomDoc = await getDoc(roomRef);

    if (roomDoc.exists()) {
      const tags = roomDoc.data().tags;
      tags.push(doc(db, "Tags", tagId));

      await updateDoc(roomRef, { tags });

      return { success: true, message: "Tag added to room" };
    }
  } catch (e) {
    return { success: false, message: e.message };
  }

  return { success: false, message: "" };
};

// Function to set the room to public
export const setRoomPublic = async (
  roomId: string,
  isPublic: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const roomRef = doc(db, "Rooms", roomId);
    const roomDoc = await getDoc(roomRef);
    if (roomDoc.exists()) {
      await updateDoc(roomRef, { isPublic });
      return { success: true, message: "Room publicity set to: " + isPublic};
    }
  } catch (e) {
    return { success: false, message: e.message };
  }

  return { success: false, message: "" };
};

export const getRoomById = async (roomId: string): Promise<{ success: boolean; room: Room }> => {
  try {
    const roomDoc = await getDoc(doc(db, "Rooms", roomId));

    if (roomDoc.exists()) {
      return {
        success: true,
        room: {
          id: roomDoc.id,
          ...(roomDoc.data() as object),
          name: roomDoc.data().name,
          isAdmin: roomDoc.data().admins.includes(auth.currentUser.uid),
          tags: roomDoc.data().tags,
          isPublic: roomDoc.data().isPublic
        },
      };
    }
  } catch (error) {
    console.error("Error fetching room: ", error);
  }

  return { success: false, room: { id: "", name: "", isAdmin: false, tags: [], isPublic: false } };
};

export const leaveRoom = async (roomId: string): Promise<{ success: boolean; message: string }> => {
  const userId = auth.currentUser.uid;

  try {
    const userDocRef = doc(db, "Users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const rooms = userDoc.data().rooms;
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].path.slice(6) === roomId) {
          const roomRef = doc(db, "Rooms", roomId);
          const roomDoc = await getDoc(roomRef);
          if (roomDoc.exists()) {
            if (roomDoc.data().users.length === 1) {
              return {
                success: false,
                message: "Cannot leave a room with only one user in it (you).",
              };
            }

            rooms.splice(i, i + 1);
            await updateDoc(userDocRef, { rooms });

            const users = roomDoc.data().users;
            const newUsers = users.filter((user: any) => user.path !== userDocRef.path);

            const admins = roomDoc.data().admins;
            const newAdmins = admins.filter((admin: any) => admin.path !== userDocRef.path);

            await updateDoc(roomRef, { users: newUsers, admins: newAdmins });

            return { success: true, message: "Room removed from user document" };
          }
        }
      }
    }
  } catch (e) {
    return { success: false, message: e.message };
  }

  return { success: false, message: "" };
};

export const createRoom = async (
  roomName: string,
  roomDescription: string,
  isPublic: boolean
): Promise<{ success: boolean; message: string }> => {
  const userId = auth.currentUser.uid;

  try {
    const userDoc = await getDoc(doc(db, "Users", userId));

    console.log("here!")
    if (userDoc.exists()) {

      const userRef = doc(db, "Users", userId);

      const roomRef = await addDoc(collection(db, "Rooms"), {
        name: roomName,
        description: roomDescription,
        isPublic: isPublic,
        users: [userRef],
        admins: [userRef],
        tags: [],
        color: "#ff0000",
      });

      const userRooms = userDoc.data().rooms || [];
      userRooms.push(roomRef);

      await updateDoc(doc(db, "Users", userId), {
        rooms: userRooms,
      });

      return { success: true, message: `${roomRef.id}` };
    }
  } catch (e) {
    return { success: false, message: e.message };
  }

  return { success: false, message: "nothing happened!" };
};


export const deleteRoom = async (
  roomId: string
): Promise<{ success: boolean; message: string }> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    return { success: false, message: "User not authenticated" };
  }

  try {
    const roomRef = doc(db, "Rooms", roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      return { success: false, message: "Room not found" };
    }

    const roomData = roomDoc.data();

    // Delete all shelves and their items if they exist
    if (roomData?.shelfList && Array.isArray(roomData.shelfList)) {
      for (const shelfRef of roomData.shelfList) {
        try {
          const shelfDoc = await getDoc(shelfRef);
          if (shelfDoc.exists()) {
            const shelfData = shelfDoc.data() as ShelfData;

            // Delete all items in the shelf if they exist
            if (shelfData.itemList && Array.isArray(shelfData.itemList)) {
              for (const itemRef of shelfData.itemList) {
                try {
                  await deleteDoc(itemRef);
                } catch (error) {
                  console.error("Error deleting item:", error);
                }
              }
            }

            // Delete the shelf
            await deleteDoc(shelfRef);
          }
        } catch (error) {
          console.error("Error processing shelf:", error);
        }
      }
    }

    // Remove room reference from all users who have this room
    if (roomData?.users && Array.isArray(roomData.users)) {
      for (const userRef of roomData.users) {
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data() as { rooms: any[] }; // Explicitly type userData
            const updatedRooms = (userData.rooms || []).filter(
              (room: any) => room.id !== roomId
            );

            await updateDoc(userRef, { rooms: updatedRooms });
          }
        } catch (error) {
          console.error("Error updating user:", error);
        }
      }
    }

    // Finally, delete the room document
    await deleteDoc(roomRef);

    return { success: true, message: "Room deleted successfully" };
  } catch (error) {
    console.error("Error in deleteRoom:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};


/**
 * Removes a user from a specified room.
 *
 * This function updates both the room document and the user document in Firestore.
 * It removes the user reference from the room's users array and the room reference
 * from the user's rooms array.
 *
 * @param roomId - The ID of the room from which the user should be removed.
 * @param userId - The ID of the user to be removed from the room.
 * @returns A promise that resolves to an object containing:
 *          - success: A boolean indicating whether the operation was successful.
 *          - message: A string providing information about the result of the operation.
 *
 * @throws Will throw an error if there's a problem accessing Firestore or updating documents.
 */
export const removeUserFromRoom = async (
  roomId: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const roomRef = doc(db, "Rooms", roomId);
    const userRef = doc(db, "Users", userId);

    await updateDoc(roomRef, {
      users: arrayRemove(userRef),
    });

    await updateDoc(userRef, {
      rooms: arrayRemove(roomRef),
    });

    return { success: true, message: "User removed from room successfully" };
  } catch (error) {
    console.error("Error removing user from room: ", error);
    return { success: false, message: "Failed to remove user from room" };
  }
};

export const sendRoomInvite = async (
  roomId: string,
  userId: string
): Promise<{ success: boolean; message: string; alreadyInRoom?: boolean }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, message: "No user is signed in" };
    }

    const roomRef = doc(db, "Rooms", roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      return { success: false, message: "Room not found" };
    }

    const roomData = roomDoc.data();
    const userRef = doc(db, "Users", userId);

    // Check if user is already in the room
    const isUserInRoom = roomData.users.some(
      (user: { path: string }) => user.path === userRef.path
    );

    if (isUserInRoom) {
      return {
        success: false,
        message: "User is already in this room",
        alreadyInRoom: true,
      };
    }

    // Add notification to user's document
    await updateDoc(userRef, {
      notifications: arrayUnion({
        id: `${roomId}_${Date.now()}`,
        type: "roomInvite",
        title: "Room Invitation",
        timestamp: new Date(),
        read: false,
        roomId: roomId,
        roomName: roomData.name,
        invitedBy: currentUser.displayName,
        invitedById: currentUser.uid,
      }),
    });

    return { success: true, message: "Invitation sent successfully" };
  } catch (error) {
    console.error("Error sending room invite:", error);
    return { success: false, message: "Failed to send invitation" };
  }
};


export const changeRoomColor = async (
  roomId: string,
  color: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const roomRef = doc(db, "Rooms", roomId);
    await updateDoc(roomRef, { color });
    return { success: true, message: "Room color updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update room color" };
  }
}