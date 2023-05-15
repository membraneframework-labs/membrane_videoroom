import React, { useState } from "react";
import Button from "../../shared/components/Button";
import QuestionnairePageLayout from "../../questionnaire-page/components/QuestionnairePageLayout";
import Input from "../../shared/components/Input";
import Send from "../../questionnaire-page/icons/Send";
import Plus from "../../questionnaire-page/icons/Plus";
import Info from "../../questionnaire-page/icons/Info";
import Rating from "../../questionnaire-page/components/Rating";
import TextArea from "../../shared/components/TextArea";

type CommentBoxProps = {
  isOpen: boolean;
  setOpen: () => void;
};

const CommentBox = ({ isOpen, setOpen }: CommentBoxProps) => {
  const AddCommentButton = () => (
    <button onClick={setOpen} className="flex flex-row justify-center gap-2 p-0">
      <Plus />
      <span>Add comment</span>
    </button>
  );

  const CommentInput = () => <TextArea label="Comment (optional)" placeholder="Write your comment" className="w-96"/>;

  return (<div className="flex flex-wrap w-full justify-center">
      {isOpen ? <CommentInput /> : <AddCommentButton />}
      </div>);
};

const LeavingRoomScreen: React.FC = () => {
  const [isCommentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);

  return (
    <QuestionnairePageLayout>
      <section className="flex h-full w-full flex-col items-center justify-center gap-y-10 sm:gap-y-20">
        <h2 className="text-2xl font-medium sm:text-5xl">Thank you for participating!</h2>

        <div aria-label="content" className="flex flex-col items-center justify-center gap-10 p-0">
          <div aria-label="rating" className="flex w-full flex-col content-center justify-center gap-6 text-center">
            <h4 className="text-2xl font-medium">How would you rate...</h4>
            <div className="flex w-full flex-col content-center justify-center gap-10 sm:flex-row">
              <Rating title="Video Quality" />
              <Rating title="Audio Quality" />
              <Rating title="Screenshare Quality" />
            </div>
            <CommentBox isOpen={isCommentBoxOpen} setOpen={() => setCommentBoxOpen(true)} />
          </div>
          <div aria-label="email" className="flex w-96 flex-col items-start gap-2 p-0">
            <Input type="text" label="Your e-mail" placeholder="Your e-mail" required />
            <div className="flex flex-row gap-1">
              <Info/>
              <span className="font-aktivGrotesk text-xs">Information required</span>
            </div>
          </div>
          <div aria-label="button" className="flex flex-col content-center gap-4">
            <Button href="/" name="main-page" variant="normal" className="flex flex-wrap justify-center align-center gap-2 px-8">
              Submit <Send />
            </Button>
            <span className="font-aktivGrotesk text-xs text-text-additional">You need to rate at least one quality to submit</span>
          </div>
        </div>
      </section>
    </QuestionnairePageLayout>
  );
};

export default LeavingRoomScreen;
