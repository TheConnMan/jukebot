module.exports = {

  attributes: {
    key : {
      type: 'string',
      required: true
    },
    durationSeconds: {
      type: 'integer',
      required: true
    },
    user: {
      type: 'string',
      required: true
    },
    startTime: {
      type: 'dateTime'
    },
    thumbnail: {
      type: 'string'
    }
  }
};
