import React, { FC, useState } from "react";
import Plus from "../icons/Plus";
import TextArea from "../../shared/components/TextArea";
import Rating from "./Rating";
import Info from "../icons/Info";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import Send from "../icons/Send";
import {SubmitHandler, useForm} from "react-hook-form";

// type CommentBoxProps<V extends FieldValues> = {
//   name: Path<V>;
//   isOpen: boolean;
//   setOpen: () => void;
//   register: UseFormRegister<V>;
//   error: FieldError | undefined;
// };

// const CommentBox = ({ name, isOpen, setOpen, register, error }: CommentBoxProps) => {
//   const AddCommentButton = () => (
//     <button onClick={setOpen} className="flex flex-row justify-center gap-2 p-0">
//       <Plus />
//       <span>Add comment</span>
//     </button>
//   );

//   const CommentInput = () => (
//     <TextArea name={name} label="Comment (optional)" placeholder="Write your comment" name="comment" className="w-96" register={register} error={error}/>
//   );

//   return <div className="flex w-full flex-wrap justify-center">{isOpen ? <CommentInput /> : <AddCommentButton />}</div>;
// };

type Inputs = {
  example: string,
  exampleRequired: string,
}

type QuestionnaireProps = {
  onSubmitClick: () => void;
};

const Questionnaire: FC<QuestionnaireProps> = ({ onSubmitClick }) => {
  const {register, handleSubmit, formState: {errors}} = useForm<Inputs>();
  const [isCommentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);

  const onSubmit: SubmitHandler<Inputs> = (data) => {console.log(data); onSubmitClick(); }

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into the hook by invoking the "register" function */}
      <input defaultValue="test" {...register("example")} />
      
      {/* include validation with required or other standard HTML validation rules */}
      <input {...register("exampleRequired", { required: true })} />
      {/* errors will return when field validation fails  */}
      {errors.exampleRequired && <span>This field is required</span>}
           <Button
     type="submit"
     onClick={() => {}}
     variant="normal"
     className="align-center flex flex-wrap justify-center gap-2 px-8"
   >
     Submit <Send />
   </Button>
    </form>
  );

  // return (
  //   <div aria-label="questionnaire" className="flex flex-col items-center justify-center gap-y-10 sm:gap-y-20">
  //     <h2 className="text-2xl font-medium tracking-wide sm:text-4xl">Thank you for participating!</h2>

  //     <form aria-label="questionnaire-content" className="flex flex-col items-center justify-center gap-10 p-0"onSubmit={handleSubmit(onSubmit)}>
  //       <div
  //         aria-label="questionnaire-rating"
  //         className="flex w-full flex-col content-center justify-center gap-6 text-center"
  //       >
  //         <h4 className="text-2xl font-medium tracking-wider">How would you rate...</h4>
  //         <div className="flex w-full flex-col content-center justify-center gap-10 sm:flex-row">
  //           <Rating name="video" />
  //           <Rating name="audio" />
  //           <Rating name="screenshare" />
  //         </div>
  //         <CommentBox name={"comment"} isOpen={isCommentBoxOpen} setOpen={() => setCommentBoxOpen(true)} register={register} error={errors.comment}/>
  //       </div>
  //       <div aria-label="questionnaire-email" className="flex w-96 flex-col items-start gap-2 p-0">
  //         <Input type="text" label="Your e-mail" name="email" placeholder="Your e-mail" required />
  //         <div className="flex flex-row gap-1">
  //           <Info />
  //           <span className="font-aktivGrotesk text-xs">Information required</span>
  //         </div>
  //       </div>
  //       <div aria-label="questionnaire-submit" className="flex flex-col content-center gap-4">
  //         <Button
  //           type="submit"
  //           onClick={onSubmitClick}
  //           variant="normal"
  //           className="align-center flex flex-wrap justify-center gap-2 px-8"
  //         >
  //           Submit <Send />
  //         </Button>
  //         <span className="font-aktivGrotesk text-xs text-text-additional">
  //           You need to rate at least one quality to submit
  //         </span>
  //       </form>
  //     </div>
  //   </div>
  // );
};

export default Questionnaire;
