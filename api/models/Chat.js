module.exports = {

  attributes: {
    username : {
      type: 'string',
      required: false
    },
    message: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: true
    },
    time: {
      type: 'integer',
      required: true
    },
    // room: {
    //   model: 'room'
    // }
  }
};
