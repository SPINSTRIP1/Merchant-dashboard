// Security utility functions (same as your auth manager)
export const encrypt = (text: string): string => {
  try {
    const salt = "spinstrip2024";
    const combined = salt + text + salt;
    return btoa(combined);
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
};

export const decrypt = (encrypted: string): string => {
  try {
    const decoded = atob(encrypted);
    const salt = "spinstrip2024";
    return decoded.slice(salt.length, -salt.length);
  } catch (error) {
    console.error("Decryption error:", error);
    return encrypted;
  }
};
