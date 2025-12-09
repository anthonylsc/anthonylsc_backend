// This is a mock database of questions. In a real application, this would likely be stored in a database.
export const questions = [
  // Geography
  {
    category: 'Geography',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    answer: 'Paris',
  },
  {
    category: 'Geography',
    difficulty: 'medium',
    type: 'text',
    question: 'Which river is the longest in the world?',
    answer: 'Nile',
  },
  {
    category: 'Geography',
    difficulty: 'hard',
    type: 'multiple-answer',
    question: 'Which of the following countries are in South America? (Select all that apply)',
    options: ['Brazil', 'Spain', 'Argentina', 'Nigeria'],
    answer: ['Brazil', 'Argentina'],
  },
  {
    category: 'Geography',
    difficulty: 'easy',
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    type: "multiple-choice",
    answer: "Pacific"
  },

  // History
  {
    category: 'History',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: 'In what year did the Titanic sink?',
    options: ['1905', '1912', '1918', '1923'],
    answer: '1912',
  },
  {
    category: 'History',
    difficulty: 'hard',
    type: 'text',
    question: 'Who was the first emperor of Rome?',
    answer: 'Augustus',
  },
  {
    category: "History",
    difficulty: "easy",
    question: "Who was the first President of the United States?",
    options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"],
    type: "multiple-choice",
    answer: "George Washington"
  },
  
  // Science
  {
    category: 'Science',
    difficulty: 'easy',
    type: 'text',
    question: 'What is the chemical symbol for water?',
    answer: 'H2O',
  },
  {
    category: 'Science',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: 'What planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    answer: 'Mars',
  },
  {
    category: 'Science',
    difficulty: 'hard',
    type: 'multiple-answer',
    question: 'Which of these are noble gases? (Select all that apply)',
    options: ['Helium', 'Oxygen', 'Neon', 'Chlorine'],
    answer: ['Helium', 'Neon'],
  },

  // Pop Culture
  {
    category: 'Pop Culture',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'Who wrote the Harry Potter series?',
    options: ['J.R.R. Tolkien', 'George R.R. Martin', 'J.K. Rowling', 'Stephen King'],
    answer: 'J.K. Rowling',
  },
  {
    category: 'Pop Culture',
    difficulty: 'medium',
    type: 'text',
    question: 'Which movie won the first-ever Academy Award for Best Picture?',
    answer: 'Wings',
  },

  // Technology
  {
    category: 'Technology',
    difficulty: 'easy',
    type: 'text',
    question: 'What does CPU stand for?',
    answer: 'Central Processing Unit',
  },
  {
    category: 'Technology',
    difficulty: 'medium',
    type: 'multiple-choice',
    question: 'Which company developed the Python programming language?',
    options: ['Google', 'Microsoft', 'Dropbox', 'A Dutch research institute (CWI)'],
    answer: 'A Dutch research institute (CWI)',
  },

  // Art
  {
    category: 'Art',
    difficulty: 'medium',
    type: 'text',
    question: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
  },
  {
    category: 'Art',
    difficulty: 'hard',
    question: "Which artist is known for co-founding the Cubist movement?",
    options: ["Vincent van Gogh", "Claude Monet", "Salvador Dalí", "Pablo Picasso"],
    type: "multiple-choice",
    answer: "Pablo Picasso"
  }
];
