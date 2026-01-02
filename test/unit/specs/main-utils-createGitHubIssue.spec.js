import { createGitHubIssueUrl, createAndOpenGitHubIssueUrl } from '../../../src/main/utils/createGitHubIssue'
import { GITHUB_REPO_URL } from '../../../src/main/config'

describe('main utils createGitHubIssue', () => {
  it('builds issue url with params', () => {
    const url = new URL(createGitHubIssueUrl('title text', 'body text'))
    expect(url.toString().startsWith(`${GITHUB_REPO_URL}/issues/new`)).to.equal(true)
    expect(url.searchParams.get('title')).to.equal('title text')
    expect(url.searchParams.get('body')).to.equal('body text')
  })

  it('omits empty params', () => {
    const url = new URL(createGitHubIssueUrl())
    expect(url.searchParams.has('title')).to.equal(false)
    expect(url.searchParams.has('body')).to.equal(false)

    const onlyBody = new URL(createGitHubIssueUrl('', 'just body'))
    expect(onlyBody.searchParams.has('title')).to.equal(false)
    expect(onlyBody.searchParams.get('body')).to.equal('just body')
  })

  it('opens issue url via shell', () => {
    const { shell } = window.require('electron')
    const original = shell.openExternal
    let opened = null
    shell.openExternal = url => { opened = url }

    createAndOpenGitHubIssueUrl('bug', 'details')
    expect(opened).to.include('title=bug')
    expect(opened).to.include('body=details')

    shell.openExternal = original
  })
})
