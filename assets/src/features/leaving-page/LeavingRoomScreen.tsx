import React, { useState } from "react";
import QuestionnairePageLayout from "./components/QuestionnairePageLayout";

import Questionnaire from "./components/Questionnaire";
import ReviewSentScreen from "./components/ReviewSentScreen";

type LeavePageState = "questionnaire" | "review-sent";



const LeavingRoomScreen: React.FC = () => {
  const [pageState, setPageState] = useState<LeavePageState>("questionnaire");
  

  return (
    <QuestionnairePageLayout>
      {pageState === "questionnaire" && <Questionnaire onSubmitClick={() => setPageState("review-sent")}/>}
      {pageState === "review-sent" && <ReviewSentScreen/>}
    </QuestionnairePageLayout>
  );
};

export default LeavingRoomScreen;
