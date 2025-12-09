import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

// Global error handlers to aid debugging unexpected exits
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

import pool from './database.js';
import { createPartiesTable } from './create-tables.js'; // Import the function

const app = express();
const server = http.createServer(app);
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "https://www.anthonylsc.fr", "https://anthonylsc.github.io"];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

const port = 3000;

// const parties = {};

import { questions } from './questions.js';

createPartiesTable(); // Call the function to create the table

// Simple anti-cheat / sanitization helpers
const recentSubmissions = new Map(); // key -> timestamp
const questionTimers = new Map(); // partyCode -> current timer id
const hostGraceTimers = new Map(); // partyCode -> { timerId, timeoutMs }

function sanitizeQuestion(q) {
  if (!q) return q;
  const clone = { ...q };
  if (clone.hasOwnProperty('answer')) delete clone.answer;
  return clone;
}

function sanitizeGameForClient(game) {
  if (!game) return game;
  const g = { ...game };
  if (Array.isArray(g.questions)) {
    // During playing, do not reveal correct answers
    g.questions = g.questions.map(q => sanitizeQuestion(q));
  }
  // ALWAYS include playerAnswers - they're needed during validation
  // They contain the players' answers, not the correct answers
  return g;
}

async function emitSanitizedParty(partyCode, partyRow) {
  const sanitized = getSanitizedPartyObject(partyRow);
  io.to(partyCode).emit('party_state', sanitized);
}

function getSanitizedPartyObject(partyRow) {
  const party = {
    ...partyRow,
    players: Array.isArray(partyRow.players) ? partyRow.players : (partyRow.players ? JSON.parse(partyRow.players) : []),
    game: partyRow.game && typeof partyRow.game === 'object' ? partyRow.game : (partyRow.game ? JSON.parse(partyRow.game) : null),
  };

  let includeAnswers = false;
  if (party.game && Array.isArray(party.game.questions)) {
    // Include answers when game is over (validation phase or results phase)
    includeAnswers = party.game.currentQuestion >= party.game.questions.length;
  }

  const sanitized = { ...party };
  if (sanitized.game) {
    if (includeAnswers) {
      // During validation/results, include full game with all answers and correct answers
      sanitized.game = { ...party.game };
    } else {
      // During playing, sanitize to hide correct answers
      sanitized.game = sanitizeGameForClient(party.game);
    }
  }

  try {
    console.log(`Emitting party_state for ${party.code} includeAnswers=${includeAnswers} questionsWithAnswer=${(sanitized.game && Array.isArray(sanitized.game.questions) ? sanitized.game.questions.filter(q=>q && q.hasOwnProperty('answer')).length : 0)}`);
  } catch (e) {}

  return sanitized;
}

// Auto-advance question after timer expires
async function scheduleQuestionAdvance(partyCode, timePerQuestion) {
  // Clear any existing timer for this party
  if (questionTimers.has(partyCode)) {
    clearTimeout(questionTimers.get(partyCode));
  }

  // Set new timer to advance after timePerQuestion milliseconds
  const timerId = setTimeout(async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        const players = JSON.parse(party.players);
        const game = JSON.parse(party.game);

        // Advance to next question
        game.currentQuestion += 1;
        game.startTime = Date.now();

        await pool.query('UPDATE parties SET game = ? WHERE code = ?', [
          JSON.stringify(game),
          partyCode,
        ]);

        if (game.currentQuestion < game.questions.length) {
          // Emit next question
          io.to(partyCode).emit('next_question', {
            question: game.questions[game.currentQuestion],
            questionIndex: game.currentQuestion,
            timePerQuestion: game.settings.timePerQuestion,
            startTime: game.startTime,
          });
          // Schedule the next advance
          scheduleQuestionAdvance(partyCode, game.settings.timePerQuestion);
        } else {
          // All questions done, move to validation
          try {
            const playerAnswersCount = Array.isArray(game.playerAnswers) ? game.playerAnswers.length : 0;
            console.log(`All questions finished for party ${partyCode}. playerAnswers count=${playerAnswersCount}. Expected approx=${players.length * game.questions.length}`);
            // Log a breakdown per question to help debugging
            if (Array.isArray(game.playerAnswers)) {
              const perQ = {};
              for (const a of game.playerAnswers) {
                perQ[a.questionIndex] = (perQ[a.questionIndex] || 0) + 1;
              }
              console.log('playerAnswers per question:', perQ);
            }
          } catch (e) {
            console.warn('Error logging playerAnswers at game end for', partyCode, e);
          }
          io.to(partyCode).emit('game_over', { validationRequired: true });
          questionTimers.delete(partyCode);
        }
      }
    } catch (error) {
      console.error('Error advancing question:', error);
    }
  }, timePerQuestion * 1000);

  questionTimers.set(partyCode, timerId);
}

// Clean up all parties on server startup
async function cleanupAllParties() {
  try {
    await pool.query('DELETE FROM parties');
    console.log('All parties cleaned up on server startup');
  } catch (error) {
    console.error('Error cleaning up parties:', error);
  }
}

// Helper to delete a single party
async function deleteParty(partyCode) {
  try {
    await pool.query('DELETE FROM parties WHERE code = ?', [partyCode]);
    // Clear any pending timers for this party
    if (questionTimers.has(partyCode)) {
      clearTimeout(questionTimers.get(partyCode));
      questionTimers.delete(partyCode);
    }
    console.log('Party deleted:', partyCode);
  } catch (error) {
    console.error('Error deleting party:', error);
  }
}

// Generate a unique party code
async function generateUniquePartyCode() {
  let code;
  let exists = true;
  // Loop until we find a code not present in DB
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const [rows] = await pool.query('SELECT id FROM parties WHERE code = ?', [code]);
      exists = rows.length > 0;
    } catch (err) {
      console.error('Error checking party code uniqueness:', err);
      // If DB check fails, break and return the generated code (best-effort)
      exists = false;
    }
  }
  return code;
}

// Clean up on server start
cleanupAllParties();
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('create_party', async (settings) => {
    const {
      playerName,
      gameId,
      difficulty,
      timePerQuestion,
      numQuestions,
      categories,
    } = settings;

    const partyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newParty = {
      code: partyCode,
      players: [{ id: socket.id, name: playerName, score: 0 }],
      game: {
        type: gameId,
        settings: {
          difficulty,
          timePerQuestion,
          numQuestions,
          categories,
        },
        currentQuestion: 0,
        scores: {},
      }
    };
    
    try {
      await pool.query('INSERT INTO parties (code, players, game) VALUES (?, ?, ?)', [
        partyCode,
        JSON.stringify(newParty.players),
        JSON.stringify(newParty.game),
      ]);
      socket.join(partyCode);
      // Return the full party state so the client can navigate
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = {
          ...rows[0],
          players: JSON.parse(rows[0].players),
          game: JSON.parse(rows[0].game),
        }
          emitSanitizedParty(partyCode, party);
      }
    } catch (error) {
      console.error('Error creating party:', error);
      // Handle error, maybe emit an error event to the client
    }
  });

  socket.on('get_party_state', async (partyCode) => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = {
          ...rows[0],
          players: JSON.parse(rows[0].players),
          game: JSON.parse(rows[0].game),
        };
        socket.join(partyCode);
          socket.emit('party_state', getSanitizedPartyObject(party));
      } else {
        socket.emit('party_not_found');
      }
    } catch (error) {
      console.error('Error getting party state:', error);
    }
  });

  socket.on('join_party', async ({ partyCode, playerName }) => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        let players = JSON.parse(party.players);

        // If a player with the same name exists (e.g., reconnect), update their socket id
        const existingByNameIndex = players.findIndex(p => p.name === playerName);
        if (existingByNameIndex !== -1) {
          // Update id for reconnected player and migrate any stored answers
          const oldId = players[existingByNameIndex].id;
          players[existingByNameIndex].id = socket.id;
          try {
            const game = JSON.parse(party.game);
            if (game && Array.isArray(game.playerAnswers)) {
              let migrated = false;
              for (const ans of game.playerAnswers) {
                if (ans.playerId === oldId) {
                  ans.playerId = socket.id;
                  migrated = true;
                }
              }
              if (migrated) {
                // Persist migrated answers back to DB
                await pool.query('UPDATE parties SET game = ? WHERE code = ?', [JSON.stringify(game), partyCode]);
                console.log('Migrated playerAnswers from', oldId, 'to', socket.id, 'for party', partyCode);
              }
            }
          } catch (e) {
            console.warn('Failed to migrate playerAnswers on reconnect for', playerName, e);
          }
        } else {
          // Prevent user from joining twice by socket id
          if (players.some(p => p.id === socket.id)) {
            return;
          }
          players.push({ id: socket.id, name: playerName, score: 0 });
        }

        // If host had been marked disconnected, and a reconnect matches the host name, clear grace timer
        const game = JSON.parse(party.game);
        if (game.hostDisconnected && existingByNameIndex === 0) {
          game.hostDisconnected = false;
          delete game.hostDisconnectedAt;
          // Clear any server-side grace timer
          if (hostGraceTimers.has(partyCode)) {
            clearTimeout(hostGraceTimers.get(partyCode));
            hostGraceTimers.delete(partyCode);
          }
        }

        await pool.query('UPDATE parties SET players = ?, game = ? WHERE code = ?', [JSON.stringify(players), JSON.stringify(game), partyCode]);

        const updatedParty = { ...party, players, game };
        socket.join(partyCode);
        emitSanitizedParty(partyCode, updatedParty); // Emit to all in room
      } else {
        socket.emit('party_not_found');
      }
    } catch (error) {
      console.error('Error joining party:', error);
      // Handle error
    }
  });

  socket.on('start_game', async ({ partyCode, isRematch = false }) => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        const players = JSON.parse(party.players);
        const game = JSON.parse(party.game);

        if (players[0].id === socket.id) { // Only host can start the game
          const { difficulty, categories, numQuestions } = game.settings;

          // Smart difficulty-based filtering
          let filteredQuestions = questions.filter(q => categories.includes(q.category));
          
          if (difficulty === 'easy') {
            // Only easy questions
            filteredQuestions = filteredQuestions.filter(q => q.difficulty === 'easy');
          } else if (difficulty === 'medium') {
            // Mostly medium, some easy
            const mediumQuestions = filteredQuestions.filter(q => q.difficulty === 'medium');
            const easyQuestions = filteredQuestions.filter(q => q.difficulty === 'easy');
            filteredQuestions = mediumQuestions.concat(easyQuestions);
          } else if (difficulty === 'hard') {
            // Mostly hard, some medium/easy
            const hardQuestions = filteredQuestions.filter(q => q.difficulty === 'hard');
            const mediumQuestions = filteredQuestions.filter(q => q.difficulty === 'medium');
            const easyQuestions = filteredQuestions.filter(q => q.difficulty === 'easy');
            filteredQuestions = hardQuestions.concat(mediumQuestions).concat(easyQuestions);
          }

          // Shuffle and select questions
          filteredQuestions = filteredQuestions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);

          game.currentQuestion = 0;
          game.questions = filteredQuestions; // Store selected questions in game state
          game.startTime = Date.now(); // timestamp to sync timers
          game.playerAnswers = [];
          game.currentQuestionAnswersReceived = {};
          game.rematchVotes = [];
          if (!isRematch) {
            players.forEach(p => p.score = 0); // Reset scores only on first start
          }

          await pool.query('UPDATE parties SET players = ?, game = ? WHERE code = ?', [
            JSON.stringify(players),
            JSON.stringify(game),
            partyCode,
          ]);

          const updatedParty = { ...party, players, game };
          emitSanitizedParty(partyCode, updatedParty);
          io.to(partyCode).emit('game_started', {
            question: game.questions[game.currentQuestion],
            questionIndex: game.currentQuestion,
            timePerQuestion: game.settings.timePerQuestion,
            startTime: game.startTime,
          }); // Emit only the first question and time with startTime for sync
          
          // Schedule automatic question advance after timer expires
          scheduleQuestionAdvance(partyCode, game.settings.timePerQuestion);
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      // Handle error
    }
  });

  socket.on('submit_answer', async ({ partyCode, questionIndex, answer }) => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        const players = JSON.parse(party.players);
        const game = JSON.parse(party.game);
        
        // Ensure the questionIndex matches the current question being asked.
        // Accept submissions for the current question or for the immediately previous
        // question to tolerate small timing/network races when the server advances
        // the question at the same moment the client submits.
        if (!(questionIndex === game.currentQuestion || questionIndex === game.currentQuestion - 1)) {
          console.log(`Rejecting submit_answer: received index=${questionIndex} current=${game.currentQuestion} for party ${partyCode}`);
          return;
        }

        // Initialize playerAnswers if it doesn't exist
        if (!game.playerAnswers) {
          game.playerAnswers = [];
        }

        // Record the player's answer
        // Check if player has already submitted for this question
        const existingAnswerIndex = game.playerAnswers.findIndex(
          (ans) => ans.playerId === socket.id && ans.questionIndex === questionIndex
        );

        const playerName = players.find(p => p.id === socket.id)?.name || 'Unknown';

        if (existingAnswerIndex !== -1) {
            game.playerAnswers[existingAnswerIndex].answer = answer; // Update existing answer
            game.playerAnswers[existingAnswerIndex].playerName = playerName;
        } else {
            game.playerAnswers.push({
                playerId: socket.id,
                playerName,
                questionIndex,
                answer: answer || '', // Ensure answer is stored even if empty
                validated: false,
                isCorrect: false,
            });
        }

        console.log(`Player ${playerName} answered question ${questionIndex}: ${JSON.stringify(answer)}`);

        // Increment answers received for current question
        if (!game.currentQuestionAnswersReceived) {
            game.currentQuestionAnswersReceived = {};
        }
        game.currentQuestionAnswersReceived[questionIndex] = 
          (game.currentQuestionAnswersReceived[questionIndex] || 0) + 1;

        // Update database with recorded answer
        await pool.query('UPDATE parties SET players = ?, game = ? WHERE code = ?', [
            JSON.stringify(players),
            JSON.stringify(game),
            partyCode,
        ]);

        // Log for debugging: how many answers are stored after this submission
        try {
          const count = Array.isArray(game.playerAnswers) ? game.playerAnswers.length : 0;
          console.log(`After submit_answer: stored playerAnswers count=${count} for party ${partyCode}`);
        } catch (e) {
          console.warn('Could not log playerAnswers count', e);
        }

        const updatedParty = { ...party, players, game };
        emitSanitizedParty(partyCode, updatedParty);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  });

  socket.on('submit_validation', async ({ partyCode, validatedPlayerId, validatedQuestionIndex, isCorrect }) => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        const players = JSON.parse(party.players);
        const game = JSON.parse(party.game);

        // Ensure only host can validate
        if (players[0].id !== socket.id) {
          console.warn('Non-host tried to submit validation.');
          return;
        }

        const answerToValidate = game.playerAnswers.find(
          ans => ans.playerId === validatedPlayerId && ans.questionIndex === validatedQuestionIndex
        );

        if (answerToValidate) {
          // Allow toggling/changing validation until host moves on.
          const previouslyCorrect = !!answerToValidate.isCorrect;
          answerToValidate.validated = true;
          answerToValidate.isCorrect = !!isCorrect;

          // Update player score based on change
          const player = players.find(p => p.id === validatedPlayerId);
          if (player) {
            if (!previouslyCorrect && isCorrect) {
              player.score = (player.score || 0) + 1;
            } else if (previouslyCorrect && !isCorrect) {
              player.score = Math.max(0, (player.score || 0) - 1);
            }
          }

          await pool.query('UPDATE parties SET players = ?, game = ? WHERE code = ?', [
            JSON.stringify(players),
            JSON.stringify(game),
            partyCode,
          ]);

          const updatedParty = { ...party, players, game };
            emitSanitizedParty(partyCode, updatedParty);

          // Check if all answers for all questions have been validated
          const allAnswersValidated = game.playerAnswers.every(ans => ans.validated);
          if (allAnswersValidated && game.playerAnswers.length === (players.length * game.questions.length)) {
            io.to(partyCode).emit('final_game_over', { finalScores: players.map(p => ({ name: p.name, score: p.score })) });
            // Delete party after game ends
            setTimeout(() => deleteParty(partyCode), 2000); // 2 second delay for UI to show results
          }
        }
      }
    } catch (error) {
      console.error('Error submitting validation:', error);
    }
  });

  socket.on('disconnect', async () => {
    console.log('user disconnected:', socket.id);
    try {
      const [parties] = await pool.query('SELECT * FROM parties');
      for (const party of parties) {
        let players = JSON.parse(party.players);
        const playerIndex = players.findIndex(p => p.id === socket.id);

        if (playerIndex !== -1) {
          const isHost = playerIndex === 0;

          if (isHost) {
            // Host left: start grace period instead of immediately closing
            console.log('Host disconnected, starting grace timer for party:', party.code);
            const game = JSON.parse(party.game);
            game.hostDisconnected = true;
            game.hostDisconnectedAt = Date.now();

            await pool.query('UPDATE parties SET game = ? WHERE code = ?', [JSON.stringify(game), party.code]);

            const updatedParty = { ...party, players, game };
            emitSanitizedParty(party.code, updatedParty);
            io.to(party.code).emit('host_disconnected', { message: 'Host disconnected, waiting for reconnection', timeoutMs: 15000, hostDisconnectedAt: game.hostDisconnectedAt });

            // Clear existing timer if any
            if (hostGraceTimers.has(party.code)) {
              clearTimeout(hostGraceTimers.get(party.code));
              hostGraceTimers.delete(party.code);
            }

            const timerId = setTimeout(async () => {
              try {
                const [rowsNow] = await pool.query('SELECT * FROM parties WHERE code = ?', [party.code]);
                if (rowsNow.length === 0) return;
                const pNow = rowsNow[0];
                const playersNow = JSON.parse(pNow.players);
                const gameNow = JSON.parse(pNow.game);

                if (gameNow.hostDisconnected) {
                  if (playersNow.length > 1) {
                    // Promote next player to host (move index 1 to 0)
                    const newHost = playersNow[1];
                    playersNow.splice(1, 1);
                    playersNow.unshift(newHost);
                    gameNow.hostDisconnected = false;
                    delete gameNow.hostDisconnectedAt;

                    await pool.query('UPDATE parties SET players = ?, game = ? WHERE code = ?', [JSON.stringify(playersNow), JSON.stringify(gameNow), party.code]);

                    const updated = { ...pNow, players: playersNow, game: gameNow };
                    io.to(party.code).emit('host_promoted', { newHostId: playersNow[0].id, newHostName: playersNow[0].name });
                    emitSanitizedParty(party.code, updated);
                    console.log('Host promotion executed for party', party.code, 'new host', playersNow[0].name);
                  } else {
                    // No other players: delete party
                    await deleteParty(party.code);
                    io.to(party.code).emit('party_closed', { reason: 'Host left and no players to continue' });
                    console.log('Party closed due to host leaving with no remaining players:', party.code);
                  }
                }
              } catch (e) {
                console.error('Error in host grace timeout:', e);
              } finally {
                hostGraceTimers.delete(party.code);
              }
            }, 15000);

            hostGraceTimers.set(party.code, timerId);
          } else {
            // Non-host left: remove from players and notify
            players.splice(playerIndex, 1);
            const game = JSON.parse(party.game);
            await pool.query('UPDATE parties SET players = ? WHERE id = ?', [JSON.stringify(players), party.id]);
            const updatedParty = { ...party, players, game };
            emitSanitizedParty(party.code, updatedParty);
            console.log('Player removed from party:', party.code);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  socket.on('leave_party', async ({ partyCode }) => {
    console.log('Player intentionally leaving:', socket.id);
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        let players = JSON.parse(party.players);
        const playerIndex = players.findIndex(p => p.id === socket.id);

        if (playerIndex !== -1) {
          const isHost = playerIndex === 0;
          
          if (isHost) {
            // Host left: close party
            await deleteParty(partyCode);
            io.to(partyCode).emit('party_closed', { reason: 'Host left the game' });
          } else {
            // Non-host left: remove from players
            players.splice(playerIndex, 1);
            const game = JSON.parse(party.game);
            await pool.query('UPDATE parties SET players = ? WHERE id = ?', [JSON.stringify(players), party.id]);
            const updatedParty = { ...party, players, game };
            emitSanitizedParty(partyCode, updatedParty);
          }
        }
      }
    } catch (error) {
      console.error('Error leaving party:', error);
    }
  });

  // Host can kick a player by socket id
  socket.on('kick_player', async ({ partyCode, playerId }, cb) => {
    try {
      console.log('kick_player received from', socket.id, 'for', playerId, 'in', partyCode);
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length === 0) {
        if (typeof cb === 'function') cb({ ok: false, error: 'party_not_found' });
        return;
      }
      const party = rows[0];
      const players = JSON.parse(party.players);
      // Only host may kick
      if (players[0]?.id !== socket.id) {
        if (typeof cb === 'function') cb({ ok: false, error: 'not_host' });
        return;
      }

      const idx = players.findIndex(p => p.id === playerId);
      if (idx === -1) {
        if (typeof cb === 'function') cb({ ok: false, error: 'player_not_found' });
        return;
      }

      // Remove player from party
      const [removed] = players.splice(idx, 1);

      await pool.query('UPDATE parties SET players = ? WHERE code = ?', [JSON.stringify(players), partyCode]);

      // Notify the kicked player directly if they are connected
      const kickedSocket = io.sockets.sockets.get(playerId);
      if (kickedSocket) {
        console.log('Notifying kicked socket', playerId);
        kickedSocket.emit('kicked', { reason: 'You were kicked from the party by the host.' });
        // Force disconnect so client leaves room and updates
        try { kickedSocket.disconnect(true); } catch (e) { console.warn('Could not disconnect kicked socket', e); }
      } else {
        console.log('Kicked socket not currently connected:', playerId);
      }

      // Emit updated party state to remaining players
      const updatedParty = { ...party, players, game: JSON.parse(party.game) };
      emitSanitizedParty(partyCode, updatedParty);
      if (typeof cb === 'function') cb({ ok: true });
    } catch (err) {
      console.error('Error kicking player:', err);
      if (typeof cb === 'function') cb({ ok: false, error: String(err) });
    }
  });

  // Host can reset the party code to a new unique code
  socket.on('reset_party_code', async ({ partyCode }, cb) => {
    try {
      console.log('reset_party_code requested by', socket.id, 'for', partyCode);
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length === 0) {
        if (typeof cb === 'function') cb({ ok: false, error: 'party_not_found' });
        return;
      }

      const party = rows[0];
      const players = JSON.parse(party.players);

      // Only host may reset the code
      if (players[0]?.id !== socket.id) {
        if (typeof cb === 'function') cb({ ok: false, error: 'not_host' });
        return;
      }

      const newCode = await generateUniquePartyCode();

      // Update DB with new code
      await pool.query('UPDATE parties SET code = ? WHERE code = ?', [newCode, partyCode]);

      // Move all sockets from the old room to the new room
      const room = io.sockets.adapter.rooms.get(partyCode);
      if (room && room.size > 0) {
        for (const socketId of room) {
          const s = io.sockets.sockets.get(socketId);
          if (s) {
            try {
              s.leave(partyCode);
              s.join(newCode);
            } catch (e) {
              console.warn('Failed to move socket to new room:', socketId, e);
            }
          }
        }
      }

      // If there was a timer associated with the old code, move it over
      if (questionTimers.has(partyCode)) {
        const t = questionTimers.get(partyCode);
        questionTimers.delete(partyCode);
        questionTimers.set(newCode, t);
      }

      // Fetch updated party and emit to the new room
      const [updatedRows] = await pool.query('SELECT * FROM parties WHERE code = ?', [newCode]);
      if (updatedRows.length > 0) {
        const updatedParty = { ...updatedRows[0], players: JSON.parse(updatedRows[0].players), game: JSON.parse(updatedRows[0].game) };
        emitSanitizedParty(newCode, updatedParty);
      }

      console.log('Party code changed', partyCode, '->', newCode);
      if (typeof cb === 'function') cb({ ok: true, newCode });
    } catch (err) {
      console.error('Error resetting party code:', err);
      if (typeof cb === 'function') cb({ ok: false, error: String(err) });
    }
  });

  socket.on('submit_rematch_vote', async ({ partyCode }) => {
    try {
      const [rows] = await pool.query('SELECT * FROM parties WHERE code = ?', [partyCode]);
      if (rows.length > 0) {
        const party = rows[0];
        const players = JSON.parse(party.players);
        const game = JSON.parse(party.game);

        if (!game.rematchVotes) {
          game.rematchVotes = [];
        }

        // Add vote if not already voted
        if (!game.rematchVotes.includes(socket.id)) {
          game.rematchVotes.push(socket.id);
        }

        // Check if all players have voted for rematch
        if (game.rematchVotes.length === players.length) {
          // Start new game with same settings
          io.to(partyCode).emit('rematch_starting');
          // Trigger new game start via host
          setTimeout(() => {
            const hostSocket = Array.from(io.sockets.sockets.values()).find(s => s.id === players[0].id);
            if (hostSocket) {
              hostSocket.emit('trigger_rematch', { partyCode });
            }
          }, 500);
        } else {
          await pool.query('UPDATE parties SET game = ? WHERE code = ?', [JSON.stringify(game), partyCode]);
          io.to(partyCode).emit('rematch_vote_received', { votesReceived: game.rematchVotes.length, totalPlayers: players.length });
        }
      }
    } catch (error) {
      console.error('Error submitting rematch vote:', error);
    }
  });

  socket.on('advance_validation', ({ partyCode, questionIndex, playerIndex }) => {
    try {
      // Broadcast validation advancement to all players in the room
      io.to(partyCode).emit('validation_advanced', {
        questionIndex,
        playerIndex,
      });
      console.log(`Validation advanced: Question ${questionIndex}, Player ${playerIndex} in party ${partyCode}`);
    } catch (error) {
      console.error('Error advancing validation:', error);
    }
  });
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Friendly error handler for listen errors (e.g., port already in use)
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please free the port or set a different PORT.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});
