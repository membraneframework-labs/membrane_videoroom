import { useContext } from "react";
import { PreviewSettingsContext } from "../context/PreviewSettingsContext";

export const usePreviewSettings = () => useContext(PreviewSettingsContext);
