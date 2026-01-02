import { PassThrough } from 'stream'
import { EventEmitter } from 'events'
import childProcess from 'child_process'
import FileSearcher from '../../../src/renderer/node/fileSearcher'

const createSpy = returnValue => {
  const spy = (...args) => {
    spy.called = true
    spy.callCount += 1
    spy.calls.push(args)
    return typeof returnValue === 'function' ? returnValue(...args) : returnValue
  }
  spy.called = false
  spy.callCount = 0
  spy.calls = []
  Object.defineProperty(spy, 'calledOnce', { get: () => spy.callCount === 1 })
  spy.calledWith = (...expected) => spy.calls.some(args => args.length === expected.length && args.every((val, idx) => val === expected[idx]))
  return spy
}

describe('renderer node fileSearcher', () => {
  const originalSpawn = childProcess.spawn

  beforeEach(() => {
    global.marktext = { paths: { ripgrepBinaryPath: 'rg' } }
  })

  afterEach(() => {
    childProcess.spawn = originalSpawn
  })

  it('builds ripgrep args from options and streams matches', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = createSpy()

    const spawnSpy = createSpy(() => child)
    childProcess.spawn = spawnSpy

    const searcher = new FileSearcher()

    const didMatch = createSpy()
    const didSearchPaths = createSpy()
    const promise = searcher.searchInDirectory('/project', '', {
      followSymlinks: true,
      includeHidden: true,
      noIgnore: true,
      inclusions: ['src'],
      didMatch,
      didSearchPaths
    }, { num: 0 })

    // Simulate ripgrep output
    stdout.write('a.js\n')
    stdout.write('b.js\n')
    stdout.end()
    child.emit('close', 0)

    await promise

    expect(spawnSpy.calledOnce).to.equal(true)
    const [, args, opts] = spawnSpy.calls[0]
    expect(args).to.deep.equal([
      '--files',
      '--follow',
      '--hidden',
      '--no-ignore',
      '--iglob', '**/src',
      '--iglob', '**/src/**',
      '--', '/project'
    ])
    expect(opts.cwd).to.equal('/project')
    expect(didMatch.callCount).to.equal(2)
    expect(didMatch.calledWith('a.js')).to.equal(true)
    expect(didMatch.calledWith('b.js')).to.equal(true)
    expect(didSearchPaths.callCount).to.equal(2)
  })

  it('supports cancellation and stops processing', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = createSpy(() => {
      child.emit('close', 0)
    })

    const spawnSpy = createSpy(() => child)
    childProcess.spawn = spawnSpy

    const searcher = new FileSearcher()
    const didMatch = createSpy()
    const didSearchPaths = createSpy()
    const promise = searcher.searchInDirectory('/project', '', {
      inclusions: [],
      didMatch,
      didSearchPaths
    }, { num: 0 })

    promise.cancel()
    stdout.write('late.js\n')
    stdout.end()

    await promise
    expect(child.kill.calledOnce).to.equal(true)
    expect(didMatch.called).to.equal(false)
    expect(didSearchPaths.called).to.equal(false)
  })

  it('rejects when spawn throws', async () => {
    childProcess.spawn = () => { throw new Error('boom') }
    const searcher = new FileSearcher()
    let err
    try {
      await searcher.searchInDirectory('/project', '', { inclusions: [] }, { num: 0 })
    } catch (e) {
      err = e
    }
    expect(err).to.be.an('error')
    expect(err.message).to.equal('boom')
  })

  it('rejects on ripgrep error exit with stderr content', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = () => {}

    childProcess.spawn = () => child

    const searcher = new FileSearcher()

    const promise = searcher.searchInDirectory('/project', '', { inclusions: [] }, { num: 0 })
    stderr.write('fatal error')
    stderr.end()
    child.emit('close', 2)

    let err
    try {
      await promise
    } catch (e) {
      err = e
    }
    expect(err).to.be.an('error')
    expect(err.message).to.contain('fatal error')
  })
})
