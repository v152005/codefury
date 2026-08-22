const userModel = require("../models/userModel");
const { validateProfileInput } = require("../utils/profileValidator");

/**
 * Handles creation or updating of the user's accessibility profile.
 */
const createOrUpdateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const profileData = req.body;

    const validation = validateProfileInput(profileData);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.message });
    }

    // Check if user exists in the database
    const user = await userModel.findUserById(uid);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { displayName, preferredLanguage, accessibilityNeeds, interactionPreferences } = profileData;

    // Build update object
    const updateObj = {
      preferredLanguage,
      accessibilityNeeds,
      interactionPreferences,
    };
    if (displayName) {
      updateObj.name = displayName;
    }

    await userModel.updateUserProfile(uid, updateObj);

    // Retrieve the newly updated document
    const updatedUser = await userModel.findUserById(uid);

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: {
        uid: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        preferredLanguage: updatedUser.preferredLanguage,
        accessibilityNeeds: updatedUser.accessibilityNeeds,
        interactionPreferences: updatedUser.interactionPreferences,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches the user's accessibility profile.
 */
const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;

    const user = await userModel.findUserById(uid);
    if (!user) {
      return res.status(404).json({ error: "Profile not found." });
    }

    // Default object values if not set yet
    const profile = {
      uid: user.id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage || null,
      accessibilityNeeds: user.accessibilityNeeds || [],
      interactionPreferences: user.interactionPreferences || {
        voiceInput: false,
        voiceOutput: false,
        transcription: false,
        conversationalGuidance: false,
        simplifiedInstructions: false,
      },
    };

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
};
