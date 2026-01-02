import fs from 'fs'
import path from 'path'
import os from 'os'
import pandoc from '../../../src/main/utils/pandoc'
import commandExists from 'command-exists'
const childProcessId = require.resolve('child_process')

describe('main utils pandoc', () => {
  const originalEnv = process.env.MARKTEXT_PANDOC

  afterEach(() => {
    process.env.MARKTEXT_PANDOC = originalEnv
  })

  it('checks custom pandoc path via env', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mt-pandoc-'))
    const fake = path.join(tmp, 'pandoc-bin')
    fs.writeFileSync(fake, '')
    process.env.MARKTEXT_PANDOC = fake
    expect(pandoc.exists()).to.equal(true)
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('falls back to system pandoc detection', () => {
    process.env.MARKTEXT_PANDOC = ''
    const original = commandExists.sync
    commandExists.sync = () => true
    expect(pandoc.exists()).to.equal(true)
    commandExists.sync = original
  })

  it('converts content and supports stream usage', async () => {
    const originalSpawn = require.cache[childProcessId]
    require.cache[childProcessId] = { exports: { spawn: () => {
      const proc = new (require('events'))()
      proc.stdout = new (require('events'))()
      const stdin = new (require('events'))()
      stdin.end = () => {}
      proc.stdin = stdin
      setImmediate(() => {
        proc.stdout.emit('data', 'hello')
        proc.stdout.emit('end')
      })
      return proc
    } } }

    delete require.cache[require.resolve('../../../src/main/utils/pandoc')]
    const freshPandoc = require('../../../src/main/utils/pandoc').default

    const converter = freshPandoc('md', 'html')
    const result = await converter()
    expect(result).to.equal('hello')

    const stream = converter.stream({ pipe: dest => { dest.emit('data', 'stream'); dest.emit('end'); return dest } })
    let collected = ''
    stream.on('data', d => { collected += d })
    await new Promise(resolve => stream.on('end', resolve))
    expect(collected).to.equal('hello')

    if (originalSpawn) {
      require.cache[childProcessId] = originalSpawn
    } else {
      delete require.cache[childProcessId]
    }
  })
})
