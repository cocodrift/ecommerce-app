import fs from 'fs'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

function ensureJSON(path, data) {
  if (!fs.existsSync(path) || fs.readFileSync(path, 'utf8').trim() === '') {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  }
}

if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data')
}

ensureJSON('./data/users.json', { users: [] })
ensureJSON('./data/ledger.json', { entries: [] })

export const usersDB = new Low(new JSONFile('./data/users.json'), { users: [] })
export const ledgerDB = new Low(new JSONFile('./data/ledger.json'), { entries: [] })

await usersDB.read()
await ledgerDB.read()

