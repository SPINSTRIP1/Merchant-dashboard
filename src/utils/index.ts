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

// Format amount to Nigerian Naira
export const formatAmount = (amount: number): string => {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format ISO date string to DD/MM/YYYY
export const formatISODate = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const capitalizeFirstLetter = (str: string | undefined): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
