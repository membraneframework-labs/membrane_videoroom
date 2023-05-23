export const loadObject = <T>(key: string, defaultValue: T): T => {
  const stringValue = loadString(key, "");
  if (stringValue === "") {
    return defaultValue;
  }
  return JSON.parse(stringValue) as T;
};
export const loadString = (key: string, defaultValue = "") => {
  const value = localStorage.getItem(key);
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
};
export const saveObject = <T>(key: string, value: T) => {
  const stringValue = JSON.stringify(value);
  saveString(key, stringValue);
};
export const saveString = (key: string, value: string) => {
  localStorage.setItem(key, value);
};
