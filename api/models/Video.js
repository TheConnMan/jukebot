module.exports = {

  attributes: {
    key : {
      type: 'string',
      required: true
    },
    title: {
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
      type: 'datetime'
    },
    thumbnail: {
      type: 'string'
    },
    playing: {
      type: 'boolean',
      defaultsTo: false
    },
    played: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};
