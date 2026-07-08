export interface Teacher {
  name: string;
  role: string;
  avatar: string;
  bio?: string;
}

export interface Resource {
  name: string;
  size: string;
  type: string;
}

export interface TimestampNote {
  time: string;
  seconds: number;
  text: string;
}

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  seconds: number;
  videoUrl: string;
  description: string;
  completed: boolean;
  resources: Resource[];
  notes: TimestampNote[];
  transcript: { time: string; text: string }[];
  password?: string; // Admin assigned secure password
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  lecturesCount: number;
  rating: number;
  image: string;
  progress: number;
  studentsCount: number;
  teacher: Teacher;
  lectures: Lecture[];
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  name: string;
  role: string;
  university: string;
  text: string;
  avatar: string;
  rating: number;
}

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
  anatomyHighlights?: string[];
}
