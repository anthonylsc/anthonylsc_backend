# Anthony LSC Backend (Production)

Express + Socket.IO backend for the Anthony LSC portfolio games feature.

**⚠️ IMPORTANT:** This is a synchronized copy of the backend source.
- **Primary source**: `../anthony.lsc/server/`
- **This folder**: Production deployment copy (Render)
- **DO NOT edit files directly here** - they will be overwritten on sync

## Architecture

```
anthony.lsc/server/ (SOURCE)
    ↓ npm run sync-backend
mon-backend/ (PRODUCTION COPY)
    ↓ git push
Render Deploy
```

## Setup

### Requirements
- Node.js 16+
- MySQL database

### Environment Variables (.env)

```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
```

### Install & Run

```bash
npm install
npm start
```

## Structure

**Auto-synced files (read-only):**
- `server.js` - Express app + Socket.IO
- `database.js` - MySQL connection pool
- `questions.js` - Quiz questions (EN/FR)
- `create-tables.js` - Database schema

**Local only:**
- `package.json` - Dependencies
- `.env` - Environment variables
- `.gitignore` - Git rules

## Deployment

### From Source (anthony.lsc/)

```bash
cd anthony.lsc
npm run sync-backend  # Sync files to mon-backend/
npm run deploy:backend # Commit + push to Render
```

Or manually:
```bash
npm run sync-backend
cd ../Desktop/mon-backend
git add .
git commit -m "chore: sync backend from source"
git push origin main
```

### Via Render

- Render webhook automatically deploys on `git push`
- Check Render dashboard for build logs
- Live at: https://anthonylscbackend-production.up.railway.app

## API Endpoints

### Socket.IO Events

**Game Room:**
- `join_party` - Join a game lobby
- `start_game` - Host starts game
- `submit_answer` - Player submits answer
- `validate_answer` - Host validates
- `end_game` - Game finished

**Server Events:**
- `party_state` - Game state update
- `next_question` - New question
- `game_finished` - Results

## Database

Table: `parties`
- Auto-created on first run via `create-tables.js`
- Stores: Players, game state, answers, scores

## Important Notes

1. **Never edit files here directly** - use source in anthony.lsc/
2. **Sync before deploying** - run `npm run sync-backend`
3. **Check .gitignore** - see which files are auto-synced
4. **Environment variables** - Set in Render dashboard or .env file
5. **Logs** - Check Render dashboard for deployment logs

## See Also

- `../anthony.lsc/BACKEND_SYNC_GUIDE.md` - Sync documentation
- `../anthony.lsc/ARCHITECTURE_AUDIT.md` - Full architecture
