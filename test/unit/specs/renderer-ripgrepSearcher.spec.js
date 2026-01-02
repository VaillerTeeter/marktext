import { PassThrough } from 'stream'
import { EventEmitter } from 'events'
import childProcess from 'child_process'
import RipgrepSearcher from '../../../src/renderer/node/ripgrepSearcher'

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

describe('renderer node ripgrepSearcher', () => {
  const originalSpawn = childProcess.spawn

  beforeEach(() => {
    global.marktext = { paths: { ripgrepBinaryPath: 'rg' } }
  })

  afterEach(() => {
    childProcess.spawn = originalSpawn
  })

  it('builds ripgrep args for regexp and streams unicode matches', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = createSpy()

    const spawnSpy = createSpy(() => child)
    childProcess.spawn = spawnSpy

    const searcher = new RipgrepSearcher()
    const didMatch = createSpy()
    const didSearchPaths = createSpy()

    const promise = searcher.searchInDirectory('/project', 'héllo', {
      isRegexp: true,
      isCaseSensitive: true,
      isWholeWord: true,
      followSymlinks: true,
      maxFileSize: 10,
      includeHidden: true,
      noIgnore: true,
      leadingContextLineCount: 1,
      trailingContextLineCount: 2,
      inclusions: ['src'],
      exclusions: ['node_modules'],
      didMatch,
      didSearchPaths
    }, { num: 0 })

    stdout.write(JSON.stringify({ type: 'begin', data: { path: { bytes: Buffer.from('/project/file.md').toString('base64') } } }) + '\n')
    stdout.write(JSON.stringify({
      type: 'match',
      data: {
        lines: { text: 'héllo world\n' },
        line_number: 1,
        submatches: [{ match: { text: 'héllo' }, start: 0, end: 5 }]
      }
    }) + '\n')
    stdout.write(JSON.stringify({ type: 'end', data: { path: { text: '/project/file.md' } } }) + '\n')
    stdout.end()
    child.emit('close', 0)

    await promise

    const [, args, opts] = spawnSpy.calls[0]
    expect(args).to.deep.equal([
      '--json',
      '--regexp',
      'héllo',
      '--case-sensitive',
      '--word-regexp',
      '--follow',
      '--max-filesize',
      '10',
      '--hidden',
      '--no-ignore',
      '--before-context',
      1,
      '--after-context',
      2,
      '--iglob',
      '**/src',
      '--iglob',
      '**/src/**',
      '--iglob',
      '!**/node_modules',
      '--iglob',
      '!**/node_modules/**',
      '--',
      '/project'
    ])
    expect(opts.cwd).to.equal('/project')
    expect(didSearchPaths.calledOnce).to.equal(true)
    expect(didMatch.calledOnce).to.equal(true)
    const match = didMatch.calls[0][0].matches[0]
    expect(match.matchText).to.equal('héllo')
    expect(match.lineText).to.equal('héllo world')
    expect(match.range).to.deep.equal([[0, 0], [0, 4]])
    expect(match.leadingContextLines).to.deep.equal([])
    expect(Array.isArray(match.trailingContextLines)).to.equal(true)
  })

  it('builds fixed-string args, prepares globs, and appends pattern', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = () => {}

    const spawnSpy = createSpy(() => child)
    childProcess.spawn = spawnSpy

    const searcher = new RipgrepSearcher()
    const promise = searcher.searchInDirectory('/root/proj', 'exact', {
      isRegexp: false,
      isCaseSensitive: false,
      isWholeWord: false,
      followSymlinks: false,
      includeHidden: false,
      noIgnore: false,
      leadingContextLineCount: 0,
      trailingContextLineCount: 0,
      inclusions: ['proj', 'proj/child/', 'proj/nested'],
      exclusions: [],
      didSearchPaths: createSpy(),
      didMatch: createSpy()
    }, { num: 0 })

    stdout.write(JSON.stringify({ type: 'begin', data: { path: { text: '/root/proj/file.txt' } } }) + '\n')
    stdout.write(JSON.stringify({
      type: 'match',
      data: {
        lines: { text: 'line\n' },
        line_number: 1,
        submatches: [{ match: { text: 'line' }, start: 0, end: 4 }]
      }
    }) + '\n')
    stdout.write(JSON.stringify({ type: 'end', data: { path: { text: '/root/proj/file.txt' } } }) + '\n')
    stdout.end()
    child.emit('close', 0)

    await promise

    const [, args] = spawnSpy.calls[0]
    expect(args.slice(0, 3)).to.deep.equal(['--json', '--fixed-strings', '--ignore-case'])
    expect(args).to.include('--iglob')
    expect(args).to.include('**/*')
    expect(args).to.include('**/child')
    expect(args).to.include('**/child/**')
    expect(args).to.include('**/nested')
    expect(args).to.include('**/nested/**')
    expect(args[args.length - 2]).to.equal('exact')
    expect(args[args.length - 1]).to.equal('/root/proj')
  })

  it('rejects when spawn throws or ripgrep exits with error code', async () => {
    childProcess.spawn = () => { throw new Error('explode') }
    const searcher = new RipgrepSearcher()
    let err
    try {
      await searcher.searchInDirectory('/project', 'x', { isRegexp: false, inclusions: [], exclusions: [] }, { num: 0 })
    } catch (e) {
      err = e
    }
    expect(err).to.be.an('error')
    expect(err.message).to.equal('explode')

    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = () => {}
    childProcess.spawn = () => child

    const failure = searcher.searchInDirectory('/project', 'x', { isRegexp: false, inclusions: [], exclusions: [] }, { num: 0 })
    stderr.write('fatal')
    stderr.end()
    child.emit('close', 2)

    let exitErr
    try {
      await failure
    } catch (e) {
      exitErr = e
    }
    expect(exitErr).to.be.an('error')
    expect(exitErr.message).to.contain('fatal')
  })

  it('supports cancellation and ignores subsequent output', async () => {
    const stdout = new PassThrough()
    const stderr = new PassThrough()
    const child = new EventEmitter()
    child.stdout = stdout
    child.stderr = stderr
    child.kill = createSpy()

    childProcess.spawn = () => child

    const didMatch = createSpy()
    const didSearchPaths = createSpy()
    const searcher = new RipgrepSearcher()
    const promise = searcher.searchInDirectory('/project', 'x', {
      isRegexp: false,
      inclusions: [],
      exclusions: [],
      didMatch,
      didSearchPaths
    }, { num: 0 })

    promise.cancel()
    stdout.write(JSON.stringify({ type: 'end', data: { path: { text: '/project/file' } } }) + '\n')
    child.emit('close', 0)

    await promise
    expect(child.kill.calledOnce).to.equal(true)
    expect(didMatch.called).to.equal(false)
    expect(didSearchPaths.called).to.equal(false)
  })

  it('propagates cancellation across directories via search()', async () => {
    const searcher = new RipgrepSearcher()
    const p1 = { cancel: createSpy() }
    const p2 = { cancel: createSpy() }
    const stub = createSpy(() => p1)
    stub.calls.push([p2])
    searcher.searchInDirectory = dir => (dir === '/a' ? p1 : p2)

    const promise = searcher.search(['/a', '/b'], 'x', { inclusions: [], exclusions: [] })
    promise.cancel()

    expect(p1.cancel.calledOnce).to.equal(true)
    expect(p2.cancel.calledOnce).to.equal(true)
  })

  it('prepares regexps and detects multiline patterns', () => {
    const searcher = new RipgrepSearcher()
    expect(searcher.prepareRegexp('--')).to.equal('\\-\\-')
    const escapedSlash = 'foo\\' + '/bar'
    expect(searcher.prepareRegexp(escapedSlash)).to.equal('foo/bar')
    expect(searcher.isMultilineRegexp('foo')).to.equal(false)
    expect(searcher.isMultilineRegexp('foo\\nbar')).to.equal(true)
  })
})
