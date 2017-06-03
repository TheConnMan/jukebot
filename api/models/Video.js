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
    duration: {
      type: 'integer',
      required: true
    },
    user: {
      type: 'string',
      required: true
    },
    realuser: 'String',
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
    },
    isSuggestion: {
      type: 'boolean',
      defaultsTo: false
    },
    autoplay: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};
