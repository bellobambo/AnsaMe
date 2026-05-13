const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  "Sign in with Google to continue": "Please sign in with Google to continue.",
  "Valid exam type is required": "Choose a valid exam type.",
  "Valid difficulty is required": "Choose a valid difficulty level.",
  "Subject is required": "Choose a subject before continuing.",
  "Topic is required": "Choose or enter a topic before continuing.",
  "Valid session id is required": "We could not find this practice session. Please try again.",
  "Student answers are required": "Answer at least one question before submitting.",
  "Question id is required": "Choose a question to review.",
  "Practice session not found": "This practice session could not be found.",
  "Question not found": "This question could not be found.",
  "Theory answer images must be 2MB or smaller":
    "Please upload a theory answer image that is 2MB or smaller.",
  "AI did not return exactly 20 questions":
    "We could not create a complete question set. Please try again.",
  "AI did not return exactly 4 theory questions":
    "We could not create the theory section. Please try again.",
  "The AI response was not valid JSON":
    "We could not format the AI response correctly. Please try again."
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  return FRIENDLY_ERROR_MESSAGES[error.message] || fallback;
}
