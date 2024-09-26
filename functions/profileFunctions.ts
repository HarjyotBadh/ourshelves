import { getFirestore, doc, runTransaction, arrayUnion, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


// function to update user's "About Me" section of their profile page 
export const updateProfileAbtMe = async (updatedAboutMe: string): Promise<{ success: boolean; message: string }> => {
  const auth = getAuth();
  const db = getFirestore();

  // For now, we're using a placeholder userId. In a real app, you'd use auth.currentUser.uid
  const profileId = "SZN3uKd5nTwYvrmy7TJf"; // Placeholder
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
  const auth = getAuth();
  const db = getFirestore();

  // For now, we're using a placeholder userId. In a real app, you'd use auth.currentUser.uid
  const profileId = "dMxt0UarTkFUIHIa8gJC"; // Placeholder
  const profileRef = doc(db, 'Users', profileId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      transaction.update(profileRef, {
        ProfilePic: updatedIcon,
      });

      return { success: true, message: 'Successfully user icon' };
    });

    return result;
  } catch (error) {
    console.error("Error when updating profile:", error);
    return { success: false, message: "Failed to update profile. Please try again later." };
  }
};
