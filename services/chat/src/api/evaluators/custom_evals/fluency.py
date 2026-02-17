import json
import os

import vertexai
from dotenv import load_dotenv
from vertexai.generative_models import GenerativeModel

load_dotenv()

def fluency_evaluation(question, context, answer) -> str:
    """
    Evaluates fluency score for QA scenario using Gemini 2.5 Flash
    Returns a score between 1-5
    """

    # Initialize Vertex AI
    project_id = os.environ.get("PROJECT_ID")
    region = os.environ.get("REGION", "us-central1")

    if not project_id:
        raise ValueError("PROJECT_ID environment variable is required")

    vertexai.init(project=project_id, location=region)

    # Create the evaluation prompt
    prompt = f"""You are an AI assistant. You will be given the definition of an evaluation metric for assessing the quality of an answer in a question-answering task. Your job is to compute an accurate evaluation score using the provided evaluation metric. You should return a single integer value between 1 to 5 representing the evaluation metric. You will include no other text or information.

Fluency measures the quality of individual sentences in the answer, and whether they are well-written and grammatically correct. Consider the quality of individual sentences when evaluating fluency. Given the question and answer, score the fluency of the answer between one to five stars using the following rating scale:
One star: the answer completely lacks fluency
Two stars: the answer mostly lacks fluency
Three stars: the answer is partially fluent
Four stars: the answer is mostly fluent
Five stars: the answer has perfect fluency

This rating value should always be an integer between 1 and 5. So the rating produced should be 1 or 2 or 3 or 4 or 5.

question: {question}
answer: {answer}
stars:"""

    # Use Gemini 2.5 Flash model
    model = GenerativeModel("gemini-2.5-flash")

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()

        # Validate that result is a number between 1-5
        try:
            score = int(result)
            if 1 <= score <= 5:
                return str(score)
            else:
                return "3"  # Default fallback
        except ValueError:
            return "3"  # Default fallback

    except Exception as e:
        print(f"Error in fluency evaluation: {e}")
        return "3"  # Default fallback

if __name__ == "__main__":
   json_input = '''{
  "question": "What feeds all the fixtures in low voltage tracks instead of each light having a line-to-low voltage transformer?",
  "context": "Track lighting, invented by Lightolier, was popular at one period of time because it was much easier to install than recessed lighting, and individual fixtures are decorative and can be easily aimed at a wall. It has regained some popularity recently in low-voltage tracks, which often look nothing like their predecessors because they do not have the safety issues that line-voltage systems have, and are therefore less bulky and more ornamental in themselves. A master transformer feeds all of the fixtures on the track or rod with 12 or 24 volts, instead of each light fixture having its own line-to-low voltage transformer. There are traditional spots and floods, as well as other small hanging fixtures. A modified version of this is cable lighting, where lights are hung from or clipped to bare metal cables under tension",
  "answer": "The main transformer is the object that feeds all the fixtures in low voltage tracks."
}'''
   args = json.loads(json_input)

   result = fluency_evaluation(**args)
   print(result)