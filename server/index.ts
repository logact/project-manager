import { initDb, seedDb } from './db.js'
import app from './api.js'

const PORT = process.env.PORT || 3001

initDb()
seedDb()

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
