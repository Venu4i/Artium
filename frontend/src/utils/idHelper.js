export const getSafeId = (userField) => {
    if (!userField) return null;
    // Returns the _id or id if it's an object, otherwise returns the string itself
    return typeof userField === 'object' ? (userField._id || userField.id) : userField;
};

export const isSameUser = (userA, userB) => {
    const idA = getSafeId(userA);
    const idB = getSafeId(userB);
    return idA && idB && String(idA) === String(idB);
};