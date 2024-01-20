const express = require('express')
const path = require("path")

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, "cricketTeam.db")

let db = null;

// ServerDb initialize
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// Get Players API
app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team
    ORDER BY 
      player_id`
  const playerArray = await db.all(getPlayerQuery)
  response.send(playerArray)
})

//Add Player API
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerId, playerName, jerseyNumber, role} = playerDetails

  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_id, player_name, jersey_number, role)
    VALUES 
      (
        ${playerId},
       '${playerName}',
        ${jerseyNumber},
       '${role}'
      );`

  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

// Get Player API
app.get('/players/:playerId', async (request, response) => {
  const playerId = request.params
  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      cricket_team
    WHERE 
      player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(player)
})

// Update Player API
app.put('/players/:playerId', async (request, response) => {
  const playerId = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `
    UPDATE 
      cricket_team
    SET
      player_id = ${playerId},
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'  
    WHERE 
      player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// Delete player
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM 
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
