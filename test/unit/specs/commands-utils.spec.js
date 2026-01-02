import fs from 'fs-extra'
import path from 'path'
import os from 'os'
import { isUpdatable } from '../../../src/renderer/commands/utils'

describe('commands utils isUpdatable', () => {
  const originalAppImage = process.env.APPIMAGE
  const originalResourcesDescriptor = Object.getOwnPropertyDescriptor(process, 'resourcesPath')
  const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
  let markerPath
  let icoPath

  afterEach(async () => {
    process.env.APPIMAGE = originalAppImage
    if (originalResourcesDescriptor) {
      Object.defineProperty(process, 'resourcesPath', originalResourcesDescriptor)
    }
    if (originalPlatform && originalPlatform.value) {
      Object.defineProperty(process, 'platform', originalPlatform)
    }
    if (markerPath) await fs.remove(markerPath).catch(() => {})
    if (icoPath) await fs.remove(icoPath).catch(() => {})
    markerPath = null
    icoPath = null
  })

  it('returns false when update marker is absent', () => {
    expect(isUpdatable()).to.equal(false)
  })

  it('returns true when app-update.yml exists at resourcesPath and APPIMAGE set', async () => {
    const resDir = process.resourcesPath || os.tmpdir()
    markerPath = path.join(resDir, 'app-update.yml')
    await fs.outputFile(markerPath, 'config')
    process.env.APPIMAGE = '1'
    expect(isUpdatable()).to.equal(true)
  })

  it('returns false when marker exists but no updater available', async () => {
    const mockedResourcePath = await fs.mkdtemp(path.join(os.tmpdir(), 'mt-update-'))
    Object.defineProperty(process, 'resourcesPath', { value: mockedResourcePath, writable: true, configurable: true })
    markerPath = path.join(mockedResourcePath, 'app-update.yml')
    await fs.outputFile(markerPath, 'config')
    delete process.env.APPIMAGE
    expect(isUpdatable()).to.equal(false)
  })

  it('returns true on Windows when update marker and setup icon exist', async () => {
    const mockedResourcePath = await fs.mkdtemp(path.join(os.tmpdir(), 'mt-update-'))
    Object.defineProperty(process, 'resourcesPath', { value: mockedResourcePath, writable: true, configurable: true })
    markerPath = path.join(mockedResourcePath, 'app-update.yml')
    icoPath = path.join(mockedResourcePath, 'md.ico')
    await fs.outputFile(markerPath, 'config')
    await fs.outputFile(icoPath, 'ico')
    Object.defineProperty(process, 'platform', { value: 'win32' })
    expect(isUpdatable()).to.equal(true)
  })
})
