import { getAuth } from 'firebase/auth';
import { getFirestore, doc, runTransaction } from 'firebase/firestore';
import { auth} from 'firebaseConfig';


// function to update user's "About Me" section of their profile page 
export const updateProfileAbtMe = async (updatedAboutMe: string): Promise<{ success: boolean; message: string }> => {
  const db = getFirestore();
  const auth = getAuth();

  // For now, we're using a placeholder userId. In a real app, you'd use auth.currentUser.uid
  const profileId = auth.currentUser?.uid; // Placeholder
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
  const db = getFirestore();
  const auth = getAuth();

  // For now, we're using a placeholder userId. In a real app, you'd use auth.currentUser.uid
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
