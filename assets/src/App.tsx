import React, { FC } from "react";
import { RouterProvider } from "react-router-dom";
import { DeveloperInfoProvider } from "./contexts/DeveloperInfoContext";
import { router } from "./Routes";
import { UserProvider } from "./contexts/UserContext";
import { ToastProvider } from "./features/shared/context/ToastContext";

const App: FC = () => {
  return (
    <React.StrictMode>
      <UserProvider>
        <DeveloperInfoProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </DeveloperInfoProvider>
      </UserProvider>
    </React.StrictMode>
  );
};

export default App;
