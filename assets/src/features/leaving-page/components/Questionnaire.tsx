import React, { FC, useState } from "react";
import Plus from "../icons/Plus";
import TextArea from "../../shared/components/TextArea";
import Rating from "./Rating";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import Send from "../icons/Send";
import { Controller, FieldError, SubmitHandler, UseFormRegister, useForm } from "react-hook-form";

type RatingName = "video" | "audio" | "screenshare";

type Inputs = {
  video: number | null;
  audio: number | null;
  screenshare: number | null;
  comment: string;
  email: string;
};
import Info from "../icons/Info";

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
      className="w-96"
      register={register}
      error={error}
    />
  );

  return <div className="flex w-full flex-wrap justify-center">{isOpen ? <CommentInput /> : <AddCommentButton />}</div>;
};

type QuestionnaireProps = {
  onSubmitClick: () => void;
};

const Questionnaire: FC<QuestionnaireProps> = ({ onSubmitClick }) => {
  const [isCommentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const emailInput = watch("email");
  const emailFilled = !!emailInput && !errors.email;

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    onSubmitClick();
  };

  const ratingNames: RatingName[] = ["video", "audio", "screenshare"];

  return (
    <div aria-label="questionnaire" className="flex flex-col items-center justify-center gap-y-10 sm:gap-y-20">
      <h2 className="text-2xl font-medium tracking-wide sm:text-4xl">Thank you for participating!</h2>
      <form
        aria-label="questionnaire-content"
        className="flex flex-col items-center justify-center gap-10 p-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div
          aria-label="questionnaire-rating"
          className="flex w-full flex-col content-center justify-center gap-6 text-center"
        >
          <h4 className="text-2xl font-medium tracking-wider">How would you rate...</h4>
          <div className="flex w-full flex-col content-center justify-center gap-10 sm:flex-row">
            {ratingNames.map((name) => (
              <Controller
                key={name}
                name={name}
                control={control}
                defaultValue={null}
                render={({ field: { value, onChange } }) => (
                  <Rating name={name} value={value} onChange={(v) => onChange(v)} />
                )}
              />
            ))}
          </div>
          <CommentBox
            isOpen={isCommentBoxOpen}
            setOpen={() => setCommentBoxOpen(true)}
            register={register}
            error={errors.comment}
          />
        </div>
        <div aria-label="questionnaire-email" className="flex w-96 flex-col items-start gap-2 p-0">
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: {
                value:
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: "Please enter a valid email",
              },
              required: "Email is required",
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <Input
                type="text"
                label="Your e-mail"
                name="email"
                placeholder="Your e-mail"
                value={value ?? ""}
                onChange={(v) => onChange(v)}
                error={!!error}
                additionalText={error?.message}
                required
              />
            )}
          />
        </div>
        <div aria-label="questionnaire-submit" className="flex flex-col content-center gap-4">
          <Button
            type="submit"
            onClick={() => {}} //noop here because otherwise it directs to the homepage
            variant="normal"
            className="align-center flex flex-wrap justify-center gap-2 px-8"
            disabled={!emailFilled}
          >
            Submit <Send />
          </Button>
          <span className="font-aktivGrotesk text-xs text-text-additional">
            You need to rate at least one quality to submit
          </span>
        </div>
      </form>
    </div>
  );
};

export default Questionnaire;
