const LOGIN_STATUS_OBJ = {
  userId: null,
  adminId: 1,
  defaultCreateId: [1,2,3]
}

const TIME = {
  beforeTime: null,
  randFreshTime: 1000 * 60 * 5
}

const TOKEN_SAVE_TIME = {
  tokenSaveTime: 60 * 60 * 6
}

const SEARCH = {
  number: 1,
  limitFound: 9,
  limitHot: 10,
  limitThink: 5,
  limitList: 11

}

const CATEGORY = {
  focusCount: 3,
  commentCount: 10,
  categoryLimit: 20
}

module.exports = {
  LOGIN_STATUS_OBJ,
  TOKEN_SAVE_TIME,
  SEARCH,
  CATEGORY,
  TIME
}