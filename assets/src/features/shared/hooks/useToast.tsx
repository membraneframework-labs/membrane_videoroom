import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

const useToastContext = () => useContext(ToastContext);

export default useToastContext;
