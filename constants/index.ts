export const AIResponseFormat = `
{
  "overallScore": 0,
  "ATS": {
    "score": 0,
    "tips": [
      {
        "type": "good",
        "tip": "Short ATS note"
      }
    ]
  },
  "toneAndStyle": {
    "score": 0,
    "tips": [
      {
        "type": "improve",
        "tip": "Short tone and style title",
        "explanation": "Detailed tone and style explanation"
      }
    ]
  },
  "content": {
    "score": 0,
    "tips": [
      {
        "type": "improve",
        "tip": "Short content title",
        "explanation": "Detailed content explanation"
      }
    ]
  },
  "structure": {
    "score": 0,
    "tips": [
      {
        "type": "improve",
        "tip": "Short structure title",
        "explanation": "Detailed structure explanation"
      }
    ]
  },
  "skills": {
    "score": 0,
    "tips": [
      {
        "type": "improve",
        "tip": "Short skills title",
        "explanation": "Detailed skills explanation"
      }
    ]
  }
}`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  resumeText,
}: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      The resume text extracted from the uploaded PDF is:
      """
      ${resumeText}
      """
      A rendered image of the first resume page may also be provided for visual layout reference.
      Score content primarily from the extracted resume text above.
      Use the rendered page image only to understand visual structure, spacing, section headings, and obvious ATS layout risks.
      Do not penalize the resume for extraction artifacts such as unexpected line breaks, joined words, missing spaces, or parser ordering issues when the actual resume content is understandable.
      Do not mention PDF parsing, text extraction, parser errors, or unsupported MIME types as resume feedback unless the extracted resume text is empty or unreadable.
      Do not assume resume content that is not present.
      If the resume text is empty or unreadable, return low scores and explicitly state that the uploaded PDF could not be read.
      Provide the feedback using this exact JSON shape:
      ${AIResponseFormat}
      Return every key exactly as written.
      Every score must be an integer from 0 to 100.
      Include all five scored sections: overallScore, ATS, toneAndStyle, content, structure, and skills.
      Include 3-4 tips for every section.
      Return the analysis as a JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;
