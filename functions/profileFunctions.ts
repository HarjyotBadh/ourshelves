import { getFirestore, doc, runTransaction, arrayUnion, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Data for profile page to be queried from db
interface ProfilePage {
    aboutMe: string;
    profilePic: string;
  }

export const updateProfile = async (updatedAboutMe: string): Promise<{ success: boolean; message: string }> => {
  const auth = getAuth();
  const db = getFirestore();

  // For now, we're using a placeholder userId. In a real app, you'd use auth.currentUser.uid
  const profileId = "dMxt0UarTkFUIHIa8gJC"; // Placeholder
  const profileRef = doc(db, "ProfilePage", profileId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists()) {
        return { success: false, message: "User not found." };
      }

      transaction.update(profileRef, {
        AboutMe: updatedAboutMe,
      });

      return { success: true, message: 'Successfully updated about me' };
    });

    return result;
  } catch (error) {
    console.error("Error when updating profile:", error);
    return { success: false, message: "Failed to update profile. Please try again later." };
  }
};