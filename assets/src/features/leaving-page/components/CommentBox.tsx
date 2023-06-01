import React from "react";
import { FieldError, UseFormRegister } from "react-hook-form";
import { Inputs } from "./Questionnaire";
import Plus from "../icons/Plus";
import TextArea from "../../shared/components/TextArea";

type CommentBoxProps = {
  isOpen: boolean;
  setOpen: () => void;
  register: UseFormRegister<Inputs>;
  error: FieldError | undefined;
};

const CommentBox = ({ isOpen, setOpen, register, error }: CommentBoxProps) => {
  const AddCommentButton = () => (
    <button onClick={setOpen} className="flex flex-row justify-center gap-2 p-0">
      <Plus />
      <span>Add comment</span>
    </button>
  );

  const CommentInput = () => (
    <TextArea
      name="comment"
      label="Comment (optional)"
      placeholder="Write your comment"
      className="w-72 sm:w-96"
      register={register}
      error={error}
    />
  );

  return <div className="flex w-full flex-wrap justify-center">{isOpen ? <CommentInput /> : <AddCommentButton />}</div>;
};

export default CommentBox;
