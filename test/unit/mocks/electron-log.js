const log = (...args) => {
  // no-op logger for tests
}
log.error = (...args) => {}
log.warn = (...args) => {}
log.info = (...args) => {}
log.debug = (...args) => {}
log.verbose = (...args) => {}
log.silly = (...args) => {}
log.initialize = () => {}
module.exports = log
module.exports.default = log
