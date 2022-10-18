// TODO implement later
export function usePermissionManager() {
  navigator.mediaDevices.enumerateDevices().then((results) => {
    const videoInput: boolean = results.some((device) => device.kind === "videoinput");
    if (videoInput === false) {
      console.log("No video input devices");
    }

    // as for p

    // stop tracks
    // in other case, next call to getUserMedia may fail
    // or won't respect media constraints
    // videoInput.getTracks().forEach((track) => track.stop());
  });
}
