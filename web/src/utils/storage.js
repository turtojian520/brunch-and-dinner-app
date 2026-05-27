export const StorageKeys = {
  RECIPES: '@recipes',
  INGREDIENTS: '@ingredients',
  MENU_CALENDAR: '@menu_calendar',
};

export const saveData = async (key, data) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const getData = async (key) => {
  try {
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting data:', error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
  }
};
