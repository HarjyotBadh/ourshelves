import { doc, runTransaction , getDoc, DocumentReference} from 'firebase/firestore';
import { auth, db } from 'firebaseConfig';

type Room = {
  id: string;
  name: string;
  admins: DocumentReference[];
};

// function to update user's "About Me" section of their profile page 
export const updateProfileAbtMe = async (updatedAboutMe: string): Promise<{ success: boolean; message: string }> => {
  const profileId = auth.currentUser?.uid;
  if (!profileId) {
    throw new Error("User is not authenticated");
  }
  const profileRef = doc(db, "Users", profileId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      transaction.update(profileRef, {
        aboutMe: updatedAboutMe,
      });

      return { success: true, message: 'Successfully updated about me' };
    });

    return result;
  } catch (error) {
    console.error("Error when updating profile:", error);
    return { success: false, message: "Failed to update profile. Please try again later." };
  }
};


// Function to update user's profile icon
export const updateProfileIcon = async (updatedIcon: string): Promise<{ success: boolean; message: string }> => {

  const profileId = auth.currentUser?.uid; // Placeholder
  if (!profileId) {
    throw new Error("User is not authenticated");
  }
  const profileRef = doc(db, 'Users', profileId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      transaction.update(profileRef, {
        profilePicture: updatedIcon,
      });

      return { success: true, message: 'Successfully user icon' };
    });

    return result;
  } catch (error) {
    console.error("Error when updating profile:", error);
    return { success: false, message: "Failed to update profile. Please try again later." };
  }
};

export const getAdminRooms = async (currentUserId: string): Promise<Room[]> => {
  try {
      const userDoc = await getDoc(doc(db, 'Users', currentUserId));

      if (userDoc.exists()) {
          const roomRefs = userDoc.data().rooms;

          const roomsData = await Promise.all(
              roomRefs.map(async (roomRef) => {
                  const roomDoc = await getDoc(roomRef);

                  if (roomDoc.exists()) {
                      const roomData = roomDoc.data() as Room;
                      const isAdmin = roomData.admins.some((adminRef) => adminRef.path.includes(currentUserId));
                      
                      if (isAdmin) {
                          return {
                              id: roomDoc.id,
                              name: roomData.name,
                          };
                      }
                  }
                  return null;
              })
          );

          return roomsData.filter((room): room is Room => room !== null);
      }
  } catch (error) {
      console.error("Error fetching admin rooms: ", error);
  }

  return [];
}
