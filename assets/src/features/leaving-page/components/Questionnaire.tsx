import React, { FC, useState } from "react";
import Plus from "../icons/Plus";
import TextArea from "../../shared/components/TextArea";
import Rating from "./Rating";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import Send from "../icons/Send";
import { Controller, FieldError, SubmitHandler, UseFormRegister, useForm } from "react-hook-form";
import useSmartphoneViewport from "../../shared/hooks/useSmartphoneViewport";
import clsx from "clsx";
import noop from "../../shared/utils/noop";

type RatingName = "video" | "audio" | "screenshare";

type Inputs = {
  video: number | null;
  audio: number | null;
  screenshare: number | null;
  comment: string;
  email: string;
};

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

type SubmitButtonProps = {
  disabled: boolean;
  fullWidth?: boolean;
};

const SubmitButton = ({ fullWidth, disabled }: SubmitButtonProps) => (
  <Button
    type="submit"
    onClick={noop}
    variant="normal"
    className={clsx("align-center flex flex-wrap justify-center gap-2 px-8", fullWidth && "w-full")}
    disabled={disabled}
  >
    Submit <Send />
  </Button>
);

type QuestionnaireProps = {
  onSubmitClick: () => void;
};

const Questionnaire: FC<QuestionnaireProps> = ({ onSubmitClick }) => {
  const [isCommentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);
  const { isSmartphone } = useSmartphoneViewport();

  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const emailInput = watch("email");
  const emailFilled = !!emailInput && !errors.email;
  const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit: SubmitHandler<Inputs> = (_data) => {
    onSubmitClick();
  };

  const ratingNames: RatingName[] = ["video", "audio", "screenshare"];

  return (
    <form
      aria-label="questionnaire"
      className={clsx("flex flex-col items-center justify-center", "gap-y-10 sm:gap-y-20", isSmartphone && "mb-36")}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-2xl font-medium tracking-wide sm:text-4xl">Thank you for participating!</h2>
      <div
        aria-label="questionnaire-rating"
        className="flex w-full flex-col content-center justify-center gap-6 text-center"
      >
        <h4 className="text-xl font-medium tracking-wider sm:text-2xl">How would you rate...</h4>
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
      <div aria-label="questionnaire-email" className="flex w-72 flex-col items-start gap-2 p-0 sm:w-96">
        <Controller
          name="email"
          control={control}
          rules={{
            pattern: {
              value: emailPattern,
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
      {!isSmartphone && (
        <div aria-label="questionnaire-submit" className="flex flex-col content-center gap-4">
          <SubmitButton disabled={!emailFilled} />
          <span className="font-aktivGrotesk text-xs text-text-additional">
            You need to rate at least one quality to submit
          </span>
        </div>
      )}
      {isSmartphone && (
        <div
          className={clsx(
            "fixed bottom-0 left-0 right-0",
            "h-36 w-full bg-brand-white",
            "flex flex-col items-center gap-4",
            "px-8 pt-6"
          )}
        >
          <SubmitButton fullWidth disabled={!emailFilled} />
          <span className="font-aktivGrotesk text-xs text-text-additional">
            You need to rate at least one quality to submit
          </span>
        </div>
      )}
    </form>
  );
};

export default Questionnaire;
