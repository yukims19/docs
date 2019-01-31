import Deployments2 from './deployments2.mdx'
import Logs2 from './logs2.mdx'
import Domains2 from './domains2.mdx'
import DNS2 from './dns2.mdx'
import Certificates2 from './certificates2.mdx'
import Aliases2 from './aliases2.mdx'
import Secrets2 from './secrets2.mdx'
import Teams2 from './teams2.mdx'
import Authentication2 from './authentication2.mdx'
import OAuth2 from './oauth2.mdx'
import spec from './entireSpec.json'
import { diffString, diff } from 'json-diff'
import OneGraphAuth from 'onegraph-auth'
import Button from '~/components/buttons'
import Input from '~/components/input'
import { Menu, MenuItem, MenuDivider } from '~/components/menu'
import CommentBox from './commentBox.jsx'

const APP_ID = 'e3e709a0-3dee-4226-ab01-fae2fd689f98'
const _APP_ID = '5e1bff40-2221-4608-94aa-5db9fa28bf1f'
const repoName = 'docs'
const repoOwner = 'yukims19'

const getFileShaQuery = `query getFileSha($name: String!, $owner: String!, $branchAndFilePath: String!) {
  gitHub {
    repository(name: $name, owner: $owner) {
      object(expression: $branchAndFilePath) {
        ... on GitHubBlob {
          oid
        }
      }
    }
  }
}`

const createBranchQuery = `mutation createBranch(
    $owner: String!
    $name: String!
    $branchName: String!
) {
    gitHub {
    ogCreateBranch(
      input: {
        branchName: $branchName
        repoName: $name
        repoOwner: $owner
      }
    ) {
      ref {
        name
        id
      }
    }
  }
}`

const updateFileContentQuery = `mutation updateFile(
          $owner: String!
          $name: String!
          $branchName: String!
          $path: String!
          $message: String!
          $content: String!
          $sha: String!
      ) {
          gitHub {
    ogCreateOrUpdateFileContent(
      input: {
        message: $message
        path: $path
        repoName: $name
        repoOwner: $owner
        branchName: $branchName
        plainContent: $content,
        existingFileSha: $sha
      }
    ) {
      commit {
        message
      }
    }
  }
}`

const createPullRequestQuery = `mutation createPullRequest(
  $owner: String!
  $name: String!
  $sourceBranch: String!
  $title: String!
  $body: String
  $destinationBranch: String
) {
  gitHub {
    ogCreatePullRequest(
      input: {
        sourceBranch: $sourceBranch
        title: $title
        repoName: $name
        repoOwner: $owner
        body: $body
        destinationBranch: $destinationBranch
      }
    ) {
      pullRequest {
        id
        title
      }
    }
  }
}`

const getPRListQuery = `query allPullRequests(
  $filterTag: [String!]
  $name: String!
  $owner: String!
  $limit: Int!
) {
  gitHub {
    repository(name: $name, owner: $owner) {
      pullRequests(
        orderBy: { direction: DESC, field: CREATED_AT }
        first: $limit
        states: OPEN
        labels: $filterTag
      ) {
        nodes {
          number
          id
          title
          body
          isCrossRepository
          comments(last: 20) {
          nodes {
            id
            bodyText
            author {
              login
              avatarUrl
            }
            createdAt
          }
        }
          baseRefName
          headRef {
            prefix
            name
            id
            target {
              id
              repository {
                owner {
                  login
                  id
                }
              }
            }
          }
        }
      }
    }
  }
}`

const getPRSingleFileQuery = `query getFileContents(
  $name: String!
  $owner: String!
  $branchAndFilePath: String = "master:package.json"
) {
  gitHub {
    repository(name: $name, owner: $owner) {
      object(expression: $branchAndFilePath) {
        ... on GitHubBlob {
          text
        }
      }
    }
  }
}
`

const graphqler = (auth, query, variables) => {
  const authHeaders = auth.authHeaders()
  const n = new Request(
    'https://serve.onegraph.com/dynamic?app_id=' + APP_ID,
    //            'http://serve.onegraph.io:8082/dynamic?app_id=' + APP_ID,
    {
      headers: authHeaders,
      method: 'POST',
      body: JSON.stringify({ query: query, variables: variables }, null, 2)
    }
  )
  return fetch(n).then(response => {
    if (response.status === 200) {
      return response.json()
    } else {
      alert('Something went wrong on api server!')
    }
  })
}

const getPRList = auth => {
  return graphqler(auth, getPRListQuery, {
    owner: repoOwner,
    name: repoName,
    limit: 50,
    filterTag: ['onegraph-docs']
  })
}

const getPRSingleFile = (auth, branch, owner) => {
  return graphqler(auth, getPRSingleFileQuery, {
    owner: owner,
    name: repoName,
    branchAndFilePath: `${branch}:pages/docs/api/v2/api-docs-mdx/endpoints/entireSpec.json`
  })
}

const submitFullPr = (auth, _title, newSpec) => {
  const title = _title || 'hardcoded'
  const safeTitle = title.replace(/\W+/g, '-').toLowerCase()
  const branchName = 'docs-edit-' + safeTitle
  const filePath = 'pages/docs/api/v2/api-docs-mdx/endpoints/entireSpec.json'

  return graphqler(auth, createBranchQuery, {
    owner: 'yukims19',
    name: 'docs',
    branchName: branchName
  })
    .then(json => {
      console.log('Got json result:', json)
      return graphqler(auth, getFileShaQuery, {
        owner: 'yukims19',
        name: 'docs',
        branchAndFilePath: `${branchName}:${filePath}`
      })
    })
    .then(result => {
      const fileSha = result.data.gitHub.repository.object.oid
      console.log('Also got sha: ', fileSha)
      return graphqler(auth, updateFileContentQuery, {
        owner: 'yukims19',
        name: 'docs',
        branchName: branchName,
        path: filePath,
        message: title,
        content: JSON.stringify(newSpec, null, 2),
        sha: fileSha
      })
    })
    .then(result => {
      return graphqler(auth, createPullRequestQuery, {
        owner: 'yukims19',
        name: 'docs',
        sourceBranch: branchName,
        title: title,
        body: null,
        destinationBranch: 'master'
      })
    })
}

class Endpoints extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      auth: null,
      originalSpec: spec,
      spec: spec,
      isLoggedInGitHub: null,
      prTitle: null,
      prDetail: null,
      isModalOpen: false,
      prList: null,
      isPRListActive: false,
      focusedPR: null,
      isViewingPR: false
    }
  }

  componentDidMount() {
    const auth = new OneGraphAuth({
      appId: APP_ID
    })

    auth.isLoggedIn('github').then(isLoggedIn => {
      console.log('Is logged in: ', isLoggedIn)
      if (isLoggedIn) {
        let prNodes = getPRList(auth).then(json => {
          console.log(json)
          let jsonData = json
          let PRNodes = jsonData.data.gitHub.repository.pullRequests.nodes
          this.setState({ prList: PRNodes }, () =>
            console.log('PRLIst:', this.state.prList)
          )
        })
        this.setState(oldState => {
          return { ...oldState, auth: auth, isLoggedInGitHub: isLoggedIn }
        })
      } else {
        this.setState(oldState => {
          return { ...oldState, auth: auth, isLoggedInGitHub: false }
        })
      }
    })

    //window.testIt = this.makeNewPR.bind(this)
  }

  handleGitHubLogin() {
    const auth = this.state.auth

    auth
      .login('github')
      .then(() => {
        auth.isLoggedIn('github').then(isLoggedIn => {
          if (isLoggedIn) {
            let prNodes = getPRList(auth).then(json => {
              console.log(json)
              let jsonData = json
              let PRNodes = jsonData.data.gitHub.repository.pullRequests.nodes
              this.setState({ prList: PRNodes, isLoggedInGitHub: isLoggedIn })
            })
          } else {
            this.setState({
              isLoggedInGitHub: false
            })
          }
        })
      })
      .catch(e => console.error('Problem logging in', e))
  }

  toggleModal() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    })
  }

  updatePRInfo(field, value) {
    switch (field) {
      case 'title':
        this.setState({
          prTitle: value
        })
        break
      case 'detail':
        this.setState({
          prDetail: value
        })
        break
      default:
        console.log('Unrecognized field name: ' + field)
    }
  }

  makeNewPR() {
    console.log('New PR', this.state.spec, '<--- the spec')
    window.ogAuth = this.state.auth
    submitFullPr(this.state.auth, this.state.prTitle, this.state.spec)

    this.setState({
      isModalOpen: false,
      prTitle: null,
      prDetail: null
    })
  }

  handleClickOutsideMenu = () => {
    this.setState(() => ({
      isPRListActive: false
    }))
  }

  togglePRList() {
    this.setState(state => ({
      isPRListActive: !this.state.isPRListActive
    }))
  }

  renderMenuTrigger = ({ handleProviderRef, menu }) => {
    const { user } = this.props
    return (
      <div
        style={{
          position: 'fixed',
          top: '90px',
          right: '300px'
        }}
      >
        <Button onClick={() => this.togglePRList()}>
          {this.state.focusedPR ? (
            <li>{this.state.focusedPR.title}</li>
          ) : (
            'Requested PRs'
          )}
        </Button>
        {menu}
      </div>
    )
  }

  applyPRData(prInfo) {
    console.log(prInfo)
    getPRSingleFile(
      this.state.auth,
      prInfo.headRef.name,
      prInfo.headRef.target.repository.owner.login
    ).then(json => {
      console.log(json)
      let newSpec = JSON.parse(json.data.gitHub.repository.object.text)
      console.log('newSpec', newSpec)
      this.setState(() => ({
        spec: newSpec,
        focusedPR: prInfo,
        isViewingPR: true,
        isPRListActive: false
      }))
    })
  }

  showOriginalDoc() {
    this.setState(() => ({
      spec: this.state.originalSpec,
      isViewingPR: false
    }))
  }

  render() {
    const updateSpec = (summary, updater) => {
      const copy = JSON.parse(JSON.stringify(this.state.spec))
      const newSpec = updater(copy)

      console.log(
        'Diff after edit:',
        diffString(this.state.originalSpec, newSpec)
      )
      console.log('Diff after edit:', !!diffString(newSpec, newSpec))

      this.setState(oldState => {
        return { ...oldState, spec: newSpec }
      })
    }

    return (
      <>
        {this.state.isViewingPR ? (
          <div style={{ position: 'fixed', bottom: '20px', right: '50px' }}>
            <CommentBox
              prInfo={this.state.focusedPR}
              auth={this.state.auth}
              repoOwner={repoOwner}
              repoName={repoName}
              focusedPR={this.state.focusedPR}
              graphqler={graphqler}
              showOriginalDoc={() => this.showOriginalDoc()}
            />
          </div>
        ) : null}
        {this.state.isLoggedInGitHub ? (
          <Menu
            tip
            active={this.state.isPRListActive}
            onClickOutside={this.handleClickOutsideMenu}
            render={this.renderMenuTrigger}
            style={{ minWidth: 200, maxHeight: 230, overflow: 'auto' }}
          >
            {this.state.prList
              ? this.state.prList.map((pr, idx) => {
                  return (
                    <div>
                      {idx === 0 ? null : <MenuDivider />}
                      <MenuItem>
                        <a onClick={() => this.applyPRData(pr)}>
                          <strong>{pr.title}</strong>
                        </a>
                      </MenuItem>
                    </div>
                  )
                })
              : null}
          </Menu>
        ) : null}

        {this.state.isModalOpen ? (
          <div
            style={{
              position: 'fixed',
              top: '0px',
              left: '0px',
              width: '100vw',
              height: '100vh',
              zIndex: '1000'
            }}
          >
            <div
              style={{
                position: 'fixed',
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                opacity: '0.5'
              }}
              onClick={e => this.toggleModal()}
            />
            <form
              style={{
                width: '400px',
                backgroundColor: 'white',
                borderRadius: '4px',
                padding: '24px',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <label
                style={{
                  width: '80%',
                  margin: 'auto',
                  display: 'block',
                  fontSize: '16px'
                }}
              >
                PR Title:
              </label>
              <div
                style={{
                  width: '80%',
                  margin: '0px auto 16px auto',
                  display: 'grid'
                }}
              >
                <Input
                  onChange={e => this.updatePRInfo('title', e)}
                  required
                  placeholder="ex. Grammar Error"
                />
              </div>
              <label
                style={{
                  width: '80%',
                  margin: 'auto',
                  display: 'block',
                  fontSize: '16px'
                }}
              >
                PR Detail:
              </label>
              <div
                style={{
                  width: '80%',
                  margin: '0px auto 16px auto',
                  display: 'grid'
                }}
              >
                <Input
                  onChange={e => this.updatePRInfo('detail', e.target.value)}
                  placeholder="ex. Fix grammar error"
                />
              </div>
              <Button
                style={{
                  margin: 'auto',
                  display: 'block',
                  marginTop: '32px'
                }}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  this.makeNewPR()
                }}
              >
                Submit PR
              </Button>
            </form>
          </div>
        ) : null}
        {this.state.auth ? (
          this.state.isLoggedInGitHub ? (
            <Button
              onClick={_e => this.toggleModal()}
              style={{
                position: 'fixed',
                top: '90px',
                right: '15px'
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              style={{
                position: 'fixed',
                top: '90px',
                right: '15px'
              }}
              onClick={_e => this.handleGitHubLogin()}
            >
              Log In to GitHub
            </Button>
          )
        ) : null}
        <Deployments2
          oldSpec={this.state.originalSpec}
          spec={this.state.spec}
          updateSpec={updateSpec}
        />
      </>
    )
  }
}

export default Endpoints
/*
  <Logs2 />
  <Domains2 />
  <DNS2 />
  <Certificates2 />
  <Aliases2 />
  <Secrets2 />
  <Teams2 />
  <Authentication2 />
  <OAuth2 />
*/
