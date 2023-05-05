import React, { useState } from "react";
import Button from "../../shared/components/Button";
import QuestionnairePageLayout from "../../questionnaire-page/components/QuestionnairePageLayout";
import Input from "../../shared/components/Input";
import Send from "../../questionnaire-page/icons/Send";
import Plus from "../../questionnaire-page/icons/Plus";
import Info from "../../questionnaire-page/icons/Info";

type CommentBoxProps = {
  isOpen: boolean;
  setOpen: () => void;
}

const CommentBox = ({isOpen, setOpen}:CommentBoxProps) => {
  const AddCommentButton = () => (<button 
    onClick={setOpen} 
    className="flex flex-row justify-center gap-2 p-0">
      <Plus/>
      <span>Add comment</span>
    </button>);

  const CommentInput = () => (<Input label="Comment (optional)"/>);
  
  return isOpen ? <CommentInput/> : <AddCommentButton/>;
}


const LeavingRoomScreen: React.FC = () => {
  const [isCommentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);

  return (
    <QuestionnairePageLayout>
      <section className="flex h-full w-full flex-col items-center justify-center gap-y-10 sm:gap-y-20">
        <h2 className="text-2xl font-medium sm:text-5xl">Thank you for participating!</h2>

        <div aria-label="content" className="flex flex-col items-center justify-center p-0 gap-10">
        <div aria-label="rating" className="flex w-full flex-col content-center justify-center gap-6 text-center">
          <span>How would you rate...</span>
          <div className="flex flex-col sm:flex-row w-full justify-center content-center">
            <div className="w-64 h-16">Video Quality</div>
            <div className="w-64 h-16">Audio Quality</div>
            <div className="w-64 h-16">Screenshare Quality</div>
          </div>
          <CommentBox isOpen={isCommentBoxOpen} setOpen={() => setCommentBoxOpen(true)}/>
        </div>
        <div aria-label="email" className="flex flex-col p-0 items-start w-96 gap-2">
        <Input 
          type="text"
          label="Your e-mail"
          required/>
          <div>
            <Info/>
            <span>Information required</span>
          </div>
        </div>
        <div aria-label="button" className="flex flex-col content-center gap-4">
          <Button href="/" name="main-page" variant="normal">
            Submit <Send/>
          </Button>
          <span>You need to rate at least one quality to submit</span>
        </div>
        </div>
      </section>
    </QuestionnairePageLayout>
  );
};

export default LeavingRoomScreen;
