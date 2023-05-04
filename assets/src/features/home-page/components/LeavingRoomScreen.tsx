import React from "react";
import Button from "../../shared/components/Button";
import QuestionnairePageLayout from "../../questionnaire-page/components/QuestionnairePageLayout";
import Input from "../../shared/components/Input";
import Send from "../../questionnaire-page/icons/Send";
import Plus from "../../questionnaire-page/icons/Plus";
import Info from "../../questionnaire-page/icons/Info";

const LeavingRoomScreen: React.FC = () => {
  return (
    <QuestionnairePageLayout>
      <section className="flex h-full w-full flex-col items-center justify-center gap-y-14 sm:gap-y-20">
        <div className="flex flex-col items-center gap-y-2 text-center sm:gap-y-6">
          <h2 className="text-2xl font-medium sm:text-5xl">Thank you for participating!</h2>
        </div>

        <div className="flex w-full flex-col content-center justify-center gap-6 text-center">
          <span>How would you rate...</span>
          <div className="flex flex-col sm:flex-row w-full justify-center">
            <div className="w-64 h-16">Video Quality</div>
            <div className="w-64 h-16">Audio Quality</div>
            <div className="w-64 h-16">Screenshare Quality</div>
          </div>
          <button className="flex flex-row justify-center gap-2 p-0">
            <Plus/>
            <span>Add comment</span>
          </button>
        </div>
        <div className="flex flex-col p-0 items-start w-96 gap-2">
        <Input 
          type="text"
          label="Your e-mail"
          required/>
          <div>
            <Info/>
            <span>Information required</span>
          </div>
        </div>
        <div className="flex flex-col content-center gap-4">
          <Button href="/" name="main-page" variant="normal">
            Submit <Send/>
          </Button>
          <span>You need to rate at least one quality to submit</span>
        </div>
      </section>
    </QuestionnairePageLayout>
  );
};

export default LeavingRoomScreen;
