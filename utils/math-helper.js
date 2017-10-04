module.exports = {
  IsInt: (n) => {
    return (Number(n) === n) && (n % 1 === 0)
  },

  IsFloat: (n) => {
    return (Number(n) === n) && (n % 1 !== 0)
  },
  
}
