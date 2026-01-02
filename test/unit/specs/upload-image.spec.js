import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import cp from 'child_process'
import { Octokit } from '@octokit/rest'
import { uploadImage } from '../../../src/renderer/util/fileSystem'

const prefsBase = {
  currentUploader: 'github',
  githubToken: 'token',
  cliScript: '/bin/echo',
  imageBed: { github: { owner: 'o', repo: 'r', branch: 'main' } }
}

describe('uploadImage', () => {
  let tempDir
  let origExec
  let origExecFile
  let origRepos

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mt-upload-'))
    origExec = cp.exec
    origExecFile = cp.execFile
    origRepos = Octokit.prototype.repos
  })

  afterEach(async () => {
    cp.exec = origExec
    cp.execFile = origExecFile
    Octokit.prototype.repos = origRepos
    if (tempDir) {
      await fs.remove(tempDir)
    }
  })

  it('uploads via picgo command', async () => {
    const imgPath = path.join(tempDir, 'pic.png')
    await fs.outputFile(imgPath, 'data')

    cp.exec = (cmd, cb) => cb(null, '[PicGo SUCCESS]: http://picgo/img.png')

    const url = await uploadImage(path.join(tempDir, 'note.md'), imgPath, { ...prefsBase, currentUploader: 'picgo' })
    expect(url).to.equal('http://picgo/img.png')
  })

  it('rejects files larger than 5MB', async () => {
    const imgPath = path.join(tempDir, 'big.png')
    await fs.writeFile(imgPath, Buffer.alloc(6 * 1024 * 1024, 1))

    try {
      await uploadImage(path.join(tempDir, 'note.md'), imgPath, prefsBase)
      throw new Error('should have rejected')
    } catch (err) {
      expect(String(err)).to.include('Cannot upload more than 5M')
    }
  })
})
