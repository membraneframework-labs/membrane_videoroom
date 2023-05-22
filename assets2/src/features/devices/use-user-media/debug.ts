// eslint-disable-next-line
export const log = (message?: any, ...optionalParams: any[]) => {
  const logDeviceManager = localStorage.getItem("log-device-manager");
  if (logDeviceManager === "true") {
    console.log(message, ...optionalParams);
  }
};
// eslint-disable-next-line
export const warn = (message?: any, ...optionalParams: any[]) => {
  const logDeviceManager = localStorage.getItem("log-device-manager");
  if (logDeviceManager === "true") {
    console.warn(message, optionalParams);
  }
};
