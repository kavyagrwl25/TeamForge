export const isValidFullName = (fullName) => {
    if (typeof fullName !== "string") return false;
    const trimmed = fullName.trim();
    if (trimmed.length < 2 || trimmed.length > 30) return false;
    // Only alphabets + space
    if (!/^[a-zA-Z\s]+$/.test(trimmed)) return false;
    return true;
};

export const isValidUserName = (userName) => {
    if (typeof userName !== "string") return false;
    const trimmed = userName.trim();
    if (trimmed.length < 3 || trimmed.length > 20) return false;
    // must start & end with letter/number
    // no consecutive dots/underscores
    if (!/^[a-z0-9](?!.*[._]{2})[a-z0-9._]*[a-z0-9]$/.test(trimmed)) {
        return false;
    }
    return true;
};

export const isValidEmail = (email) => {
    if(typeof email !== "string") return false;
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email.trim());
}

export const isValidPassword = (password) => {
    if (typeof password !== "string") return false;
    const trimmed = password.trim();
    if (trimmed.length < 6) return false;
    // At least one letter and one number
    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(trimmed)) return false;
    return true;
};