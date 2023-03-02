import React from "react";
import BlockingScreen from "./BlockingScreen";
import Button from "./Button";

const Page404: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <BlockingScreen
        message={"Page not found "}
        actionElement={
          <Button href="/" variant="normal">
            {" "}
            Go to home page
          </Button>
        }
      />
    </div>
  );
};

export default Page404;
