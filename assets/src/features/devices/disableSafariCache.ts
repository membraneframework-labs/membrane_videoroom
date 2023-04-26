export const disableSafariCache = () => {
  // https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
  window.onpageshow = function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  };
};
