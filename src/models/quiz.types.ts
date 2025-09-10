

export type QuizPrompt = {
    subject: string[]; 
    qTypes: QuestionTypes[];
    difficulty: DifficultyLevels; 
    number: number;
    prev: string;
}

export type ClearUpPrompt = {
    subject: string; 
    qTypes: QuestionTypes[];
    prev: string;
}

export type ClearUp = {
    uid: string;
    created_at: string;
    type: "Clear-up";
    title: string;
    number: number;
    generated_from: "image pdf" | "text pdf";
    credits: number;
    questions: Questions['questions'];
}  

export type MCQ = {
    type: "MCQ";
    question: string;
    options: {answer: string; correct: boolean}[];
    explanation: string;
}

export type TF = {
    type: "TF";
    question: string;
    options: [{answer: boolean; correct: boolean}, {answer: boolean; correct: boolean}];
    explanation: string;
}

export type SAQ = {
    type: "SAQ";
    question: string;
    answers: string;
    explanation: string;
};

export type FIB = {
    type: "FIB";
    question: string;
    answers: string;
    explanation: string;
};

export type QuestionTypes = "MCQ" | "TF" | "SAQ" | "FIB";
export type DifficultyLevels = "basic" | "regular" | "intermediate" | "advanced" | "expert";

export const difficultyLevels = ["basic", "regular", "intermediate", "advanced", "expert"]
export const questionTypes = ["MCQ", "TF", "SAQ", "FIB"]


export type Quiz = {
    uid: string;
    type: "Quiz";
    generated_from:  "image pdf" | "text pdf";
    credits: number;
    number: number;
    topic: string;
    difficulty: DifficultyLevels;
    question_types: QuestionTypes[];
    created_at: string;
    questions: Questions['questions'];
}

export type Questions = {
    topic: string,
    questions: (TF | MCQ | SAQ | FIB)[]
}


export type GeneratePromptOptions =  {
  uid: string;
  subject: string;
  qTypes: QuestionTypes[];
  difficulty: DifficultyLevels;
  number: number;
}


export type QuizError = {
    status: "error";
    message: string;
}


export interface PDFInfo {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modDate?: string;
  pages: number;
  pageSize?: string;
  encrypted?: boolean;
  version?: string;
  fileSize?: number | string; // optional, depending on the CLI version
};
