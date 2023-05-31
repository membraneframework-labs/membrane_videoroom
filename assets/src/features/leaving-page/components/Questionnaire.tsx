import React, { FC, useState } from "react";
import Plus from "../icons/Plus";
import TextArea from "../../shared/components/TextArea";
import Rating from "./Rating";
import Info from "../icons/Info";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import Send from "../icons/Send";
import useSmartphoneViewport from "../../shared/hooks/useSmartphoneViewport";
import clsx from "clsx";

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

  const CommentInput = () => (
    <TextArea label="Comment (optional)" placeholder="Write your comment" name="comment" className="w-72 sm:w-96" />
  );

  return <div className="flex w-full flex-wrap justify-center">{isOpen ? <CommentInput /> : <AddCommentButton />}</div>;
};

type QuestionnaireProps = {
  onSubmitClick: () => void;
};

const Questionnaire: FC<QuestionnaireProps> = ({ onSubmitClick }) => {
  const [isCommentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);
  const {isSmartphone} = useSmartphoneViewport();

  return (
    <form aria-label="questionnaire" className={
      clsx("flex flex-col items-center justify-center",
      "gap-y-10 sm:gap-y-20",
      isSmartphone && "mb-36")}>
      <h2 className="text-2xl font-medium tracking-wide sm:text-4xl">Thank you for participating!</h2>

      <div aria-label="questionnaire-content" className="flex flex-col items-center justify-center gap-10 p-0">
        <div
          aria-label="questionnaire-rating"
          className="flex w-full flex-col content-center justify-center gap-6 text-center"
        >
          <h4 className="text-xl sm:text-2xl font-medium tracking-wider">How would you rate...</h4>
          <div className="flex w-full flex-col content-center justify-center gap-10 sm:flex-row">
            <Rating title="Video Quality" />
            <Rating title="Audio Quality" />
            <Rating title="Screenshare Quality" />
          </div>
          <CommentBox isOpen={isCommentBoxOpen} setOpen={() => setCommentBoxOpen(true)} />
        </div>
        <div aria-label="questionnaire-email" className="flex w-72 sm:w-96 flex-col items-start gap-2 p-0">
          <Input type="text" label="Your e-mail" name="email" placeholder="Your e-mail" required />
          <div className="flex flex-row gap-1">
            <Info />
            <span className="font-aktivGrotesk text-xs">Information required</span>
          </div>
        </div>
        {!isSmartphone &&
          <div aria-label="questionnaire-submit" className="flex flex-col content-center gap-4">
          <Button
            onClick={onSubmitClick}
            variant="normal"
            className="align-center flex flex-wrap justify-center gap-2 px-8"
          >
            Submit <Send />
          </Button>
          <span className="font-aktivGrotesk text-xs text-text-additional">
            You need to rate at least one quality to submit
          </span>
        </div>}
      </div>
      {isSmartphone && 
                <div className="fixed bottom-0 left-0 right-0 w-full h-36 bg-brand-white">
                <Button onClick={()=> {}}>Submit</Button>
              </div>}
    </form>
  );
};

export default Questionnaire;