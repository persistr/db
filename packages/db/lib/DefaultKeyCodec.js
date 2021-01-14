const codec = {
  encode: data => {
    return data.join(':')
  },
  decode: data => {
    return data.split(':').map(token => {
      const number = Number(token)
      return isNaN(number) ? token : number
    })
  }
}

module.exports = codec
