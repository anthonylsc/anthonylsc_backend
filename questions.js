// Enhanced question database with multiple types
export const questions = [
  // ========== MATHEMATICS ==========
  { category: 'Mathematics', difficulty: 'easy', type: 'text', question: 'What is 15 + 27?', questionFr: 'Combien font 15 + 27 ?', answer: '42', answerFr: '42' },
  { category: 'Mathematics', difficulty: 'medium', type: 'text', question: 'What is the square root of 144?', questionFr: 'Quelle est la racine carrée de 144 ?', answer: '12', answerFr: '12' },
  { category: 'Mathematics', difficulty: 'hard', type: 'text', question: 'What is π (Pi) rounded to 2 decimal places?', questionFr: 'Quelle est la valeur de π (Pi) arrondie à 2 décimales ?', answer: '3.14', answerFr: '3,14' },

  // ========== GENERAL KNOWLEDGE ==========
  { category: 'General Knowledge', difficulty: 'easy', type: 'multiple-choice', question: 'What is the capital of France?', questionFr: 'Quelle est la capitale de la France ?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 'Paris' },
  { category: 'General Knowledge', difficulty: 'easy', type: 'multiple-choice', question: 'How many continents are there?', questionFr: 'Combien y a-t-il de continents ?', options: ['5', '6', '7', '8'], answer: '7' },
  { category: 'General Knowledge', difficulty: 'medium', type: 'text', question: 'What is the largest planet in our solar system?', questionFr: 'Quelle est la plus grande planète de notre système solaire ?', answer: 'Jupiter', answerFr: 'Jupiter' },

  // ========== FRENCH LANGUAGE ==========
  { category: 'French Language', difficulty: 'easy', type: 'text', question: 'How do you say "thank you" in French?', questionFr: 'Comment dit-on "merci" en français ?', answer: 'Merci', answerFr: 'Merci' },
  { category: 'French Language', difficulty: 'medium', type: 'multiple-choice', question: 'Which is the correct conjugation of "être" in present tense for "je"?', questionFr: 'Quelle est la conjugaison correcte de "être" au présent pour "je" ?', options: ['suis', 'es', 'est', 'sommes'], answer: 'suis' },
  { category: 'French Language', difficulty: 'hard', type: 'text', question: 'What is the past participle of "avoir"?', questionFr: 'Quel est le participe passé de "avoir" ?', answer: 'eu', answerFr: 'eu' },

  // ========== WHO IS IT (CELEBRITY GUESSING) ==========
  { category: 'Who is it', difficulty: 'easy', type: 'multiple-choice', question: 'Famous actor known for "Titanic"', questionFr: 'Acteur célèbre connu pour "Titanic"', options: ['Brad Pitt', 'Leonardo DiCaprio', 'Tom Cruise', 'Johnny Depp'], answer: 'Leonardo DiCaprio' },
  { category: 'Who is it', difficulty: 'medium', type: 'text', question: 'British singer with "Blinding Lights" hit', questionFr: 'Chanteur britannique avec le succès "Blinding Lights"', answer: 'The Weeknd', answerFr: 'The Weeknd' },

  // ========== WHAT IS IT (OBJECT GUESSING) ==========
  { category: 'What is it', difficulty: 'easy', type: 'multiple-choice', question: 'What device is used to measure temperature?', questionFr: 'Quel appareil est utilisé pour mesurer la température ?', options: ['Barometer', 'Thermometer', 'Anemometer', 'Hygrometer'], answer: 'Thermometer' },
  { category: 'What is it', difficulty: 'medium', type: 'text', question: 'What is a group of lions called?', questionFr: 'Comment appelle-t-on un groupe de lions ?', answer: 'Pride', answerFr: 'Fierté' },

  // ========== LOGOS ==========
  { category: 'Logos', difficulty: 'easy', type: 'multiple-choice', question: 'A swoosh is the logo of which company?', questionFr: 'Un swoosh est le logo de quelle entreprise ?', options: ['Adidas', 'Nike', 'Puma', 'Reebok'], answer: 'Nike' },
  { category: 'Logos', difficulty: 'medium', type: 'text', question: 'Which tech company has a bitten apple logo?', questionFr: 'Quelle entreprise technologique a un logo de pomme mordue ?', answer: 'Apple', answerFr: 'Apple' },

  // ========== ROAD CODE (CODE DE LA ROUTE) ==========
  { category: 'Road Code', difficulty: 'easy', type: 'multiple-choice', question: 'What does a red traffic light mean?', questionFr: 'Que signifie un feu tricolore rouge ?', options: ['Slow down', 'Stop', 'Prepare to move', 'Go'], answer: 'Stop' },
  { category: 'Road Code', difficulty: 'medium', type: 'text', question: 'What is the speed limit in most city centers in France?', questionFr: 'Quelle est la limite de vitesse dans la plupart des centres-villes en France ?', answer: '50 km/h', answerFr: '50 km/h' },

  // ========== 4 IMAGES 1 WORD (PICTURE-BASED) ==========
  { category: '4 Images 1 Word', difficulty: 'easy', type: 'image-text', question: 'Common word shown in 4 images', questionFr: 'Mot commun montré en 4 images', imageUrls: ['https://via.placeholder.com/100?text=sun', 'https://via.placeholder.com/100?text=light', 'https://via.placeholder.com/100?text=bright', 'https://via.placeholder.com/100?text=day'], answer: 'light', answerFr: 'lumière' },

  // ========== LYRICS TRANSLATION (PAROLES TRADUITES) ==========
  { category: 'Lyrics Translation', difficulty: 'medium', type: 'lyrics', question: 'Guess the English song from French lyrics: "Je veux danser"', questionFr: 'Devinez la chanson anglaise à partir des paroles françaises : "Je veux danser"', answer: 'I Wanna Dance With Somebody', answerFr: 'I Wanna Dance With Somebody' },
  { category: 'Lyrics Translation', difficulty: 'hard', type: 'lyrics', question: 'Translate to English: "Tous les soirs je rêve"', questionFr: 'Traduire en anglais : "Tous les soirs je rêve"', answer: 'Every night I dream', answerFr: 'Chaque nuit je rêve' },

  // ========== ERROR/SPOT THE DIFFERENCE ==========
  { category: 'Error Spotting', difficulty: 'medium', type: 'image-text', question: 'Spot the error in the image', questionFr: 'Identifiez l\'erreur dans l\'image', imageUrls: ['https://via.placeholder.com/200?text=Error+Here'], answer: 'missing element', answerFr: 'élément manquant' },

  // ========== REBUS (VISUAL RIDDLES) ==========
  { category: 'Rebus', difficulty: 'hard', type: 'image-text', question: 'Solve this rebus puzzle', questionFr: 'Résolvez ce rébus', imageUrls: ['https://via.placeholder.com/150?text=STAND+I'], answer: 'I understand', answerFr: 'Je comprends' },

  // ========== PSYCHOTECHNIQUE TESTS ==========
  { category: 'Psychotechnique', difficulty: 'hard', type: 'text', question: 'What comes next: 2, 4, 8, 16, ?', questionFr: 'Qu\'vient après : 2, 4, 8, 16, ?', answer: '32', answerFr: '32' },
  { category: 'Psychotechnique', difficulty: 'hard', type: 'text', question: 'What comes next: A, C, E, G, ?', questionFr: 'Qu\'vient après : A, C, E, G, ?', answer: 'I', answerFr: 'I' },

  // ========== RANKING (CLASSEMENT) ==========
  { category: 'Ranking', difficulty: 'medium', type: 'ranking', question: 'Order these artists by Spotify streams (most to least)', questionFr: 'Triez ces artistes par flux Spotify (plus au moins)', imageUrls: ['https://via.placeholder.com/100?text=Artist1', 'https://via.placeholder.com/100?text=Artist2', 'https://via.placeholder.com/100?text=Artist3'], answer: ['Artist1', 'Artist3', 'Artist2'], answerFr: ['Artist1', 'Artist3', 'Artist2'] },

  // ========== GEOGRAPHY + DATE ==========
  { category: 'Geography + Date', difficulty: 'medium', type: 'text', question: 'In what year was the Eiffel Tower built?', questionFr: 'En quelle année la Tour Eiffel a-t-elle été construite ?', answer: '1889', answerFr: '1889' },
  { category: 'Geography + Date', difficulty: 'hard', type: 'text', question: 'When was the Berlin Wall built?', questionFr: 'Quand le Mur de Berlin a-t-il été construit ?', answer: '1961', answerFr: '1961' },

  // ========== ANIMAL AUDIO ==========
  { category: 'Animal Audio', difficulty: 'easy', type: 'audio', question: 'What animal makes this sound?', questionFr: 'Quel animal fait ce bruit ?', audioUrl: 'https://via.placeholder.com/audio?text=dog+bark', options: ['Dog', 'Cat', 'Cow', 'Duck'], answer: 'Dog' },
  { category: 'Animal Audio', difficulty: 'medium', type: 'audio', question: 'Identify this bird by its call', questionFr: 'Identifiez cet oiseau par son cri', audioUrl: 'https://via.placeholder.com/audio?text=bird+song', answer: 'Nightingale', answerFr: 'Rossignol' },

  // ========== PETIT BAC (WORD GAME) ==========
  { category: 'Petit Bac', difficulty: 'hard', type: 'petit-bac', question: 'Complete the grid starting with letter "B"', questionFr: 'Complétez la grille commençant par la lettre "B"', categories: ['Animal', 'Celebrity', 'Fruit/Vegetable', 'Country', 'Job'], answer: { animal: 'Bear', celebrity: 'Beyoncé', fruit: 'Banana', country: 'Belgium', job: 'Baker' }, answerFr: { animal: 'Ours', celebrity: 'Beyoncé', fruit: 'Banane', country: 'Belgique', job: 'Boulanger' } },

  // ========== BLURRED IMAGES ==========
  { category: 'Blurred Images', difficulty: 'medium', type: 'image-text', question: 'Guess what this blurred image is', questionFr: 'Devinez ce que c\'est cette image floutée', imageUrls: ['https://via.placeholder.com/200?text=Blurred+Object'], answer: 'Car', answerFr: 'Voiture' },

  // ========== CULTURE G (TRIVIA) ==========
  { category: 'Culture G', difficulty: 'easy', type: 'multiple-choice', question: 'What is the smallest country in the world?', questionFr: 'Quel est le plus petit pays du monde ?', options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], answer: 'Vatican City' },
  { category: 'Culture G', difficulty: 'hard', type: 'text', question: 'Who wrote "1984"?', questionFr: 'Qui a écrit "1984" ?', answer: 'George Orwell', answerFr: 'George Orwell' },

  // ========== FLOATED HEADS (FACE RECOGNITION) ==========
  { category: 'Floated Heads', difficulty: 'medium', type: 'image-text', question: 'Who is this person?', questionFr: 'Qui est cette personne ?', imageUrls: ['https://via.placeholder.com/150?text=Person+Portrait'], answer: 'Unknown Celebrity', answerFr: 'Célébrité Inconnue' },
];
