const request = require('superagent')

const token = process.env.TRELLO_TOKEN
const key = process.env.TRELLO_KEY

const config = require('./config.js')

const createCard = (qs) => {
  return request.post(config.TrelloURL + 'cards')
    .query({key, token})
    .query(qs)
}

const createLabel = (name, idBoard, color) => {
  return request.post(config.TrelloURL + 'labels')
    .query({
      key,
      token,
      name,
      color,
      idBoard
    })
}

const createList = (idBoard, name) => {
  return request.post(config.TrelloURL + 'lists')
    .query({
      name,
      idBoard,
      key,
      token
    })
}

const deleteCard = (idCard) => {
  return request.del(config.TrelloURL + 'cards/' + idCard)
    .query({key, token})
}

const getLabels = (idBoard) => {
  return request.get(config.TrelloURL + 'boards/' + idBoard + '/labels/')
    .query({key, token})
}

const removeLabel = async (id) => {
  await request.del(config.TrelloURL + 'labels/' + id)
    .query({key, token})
}

const updateCard = (idCard, qs) => {
  return request.put(config.TrelloURL + 'cards/' + idCard)
    .query({token, key})
    .query(qs)
}

module.exports = {
  createCard,
  createLabel,
  createList,
  deleteCard,
  getLabels,
  removeLabel,
  updateCard
}
