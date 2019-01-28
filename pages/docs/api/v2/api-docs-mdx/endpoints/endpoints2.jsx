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

const APP_ID = 'e3e709a0-3dee-4226-ab01-fae2fd689f98'

class Endpoints extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      auth: null,
      originalSpec: spec,
      spec: spec,
      isLoggedInGitHub: null,
      prTitle: null,
      prDetail: null
    }
  }

  componentDidMount() {
    const auth = new OneGraphAuth({
      appId: APP_ID
    })

    auth.isLoggedIn('github').then(isLoggedIn => {
      if (isLoggedIn) {
        this.setState(oldState => {
          return { ...oldState, auth: auth, isLoggedInGitHub: isLoggedIn }
        })
      } else {
        this.setState(oldState => {
          return { ...oldState, auth: auth, isLoggedInGitHub: false }
        })
      }
    })
  }

  handleGitHubLogin() {
    this.state.auth
      .login('github')
      .then(() => {
        auth.isLoggedIn('github').then(isLoggedIn => {
          if (isLoggedIn) {
            this.setState({
              isLoggedInGitHub: isLoggedIn
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
    console.log('New PR')
    this.setState({
      isModalOpen: false,
      prTitle: null,
      prDetail: null
    })
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
              onSubmit={e => this.makeNewPR()}
              style={{
                width: '300px',
                height: '220px',
                backgroundColor: 'white',
                borderRadius: '5px',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <label
                style={{
                  width: '80%',
                  margin: '16px auto 0px auto',
                  display: 'block',
                  fontSize: '16px'
                }}
              >
                PR Title:
              </label>
              <input
                onChange={e => this.updatePRInfo('title', e.target.value)}
                style={{
                  width: '80%',
                  margin: 'auto',
                  display: 'block',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #cfcfcf',
                  padding: '4px 8px'
                }}
                required
              />
              <label
                style={{
                  width: '80%',
                  margin: '16px auto 0px auto',
                  display: 'block',
                  fontSize: '16px'
                }}
              >
                PR Detail:
              </label>
              <input
                onChange={e => this.updatePRInfo('detail', e.target.value)}
                style={{
                  width: '80%',
                  margin: 'auto',
                  display: 'block',
                  fontSize: '16px',
                  borderRadius: '5px',
                  border: '1px solid #cfcfcf',
                  padding: '4px 8px'
                }}
              />
              <button
                type="submit"
                style={{
                  fontSize: '16px',
                  borderRadius: '3px',
                  backgroundColor: '#444444',
                  color: 'white',
                  margin: '32px auto',
                  display: 'block',
                  padding: '4px 8px',
                  border: 'none',
                  boxShadow: '0px 2px 4px #a5a5a5'
                }}
              >
                Submit PR
              </button>
            </form>
          </div>
        ) : null}
        {this.state.auth ? (
          this.state.isLoggedInGitHub ? (
            <button
              onClick={_e => this.toggleModal()}
              style={{
                fontSize: '16px',
                borderRadius: '3px',
                backgroundColor: '#444444',
                color: 'white',
                display: 'block',
                padding: '4px 8px',
                border: 'none',
                boxShadow: '0px 2px 4px #a5a5a5',
                position: 'fixed',
                top: '90px',
                right: '15px'
              }}
            >
              Save
            </button>
          ) : (
            <button
              style={{
                fontSize: '16px',
                borderRadius: '3px',
                backgroundColor: '#444444',
                color: 'white',
                display: 'block',
                padding: '4px 8px',
                border: 'none',
                boxShadow: '0px 2px 4px #a5a5a5',
                position: 'fixed',
                top: '90px',
                right: '15px'
              }}
              onClick={_e => this.handleGitHubLogin()}
            >
              Log In to GitHub
            </button>
          )
        ) : null}
        <Deployments2 spec={this.state.spec} updateSpec={updateSpec} />
        <Logs2 />
        <Domains2 />
        <DNS2 />
        <Certificates2 />
        <Aliases2 />
        <Secrets2 />
        <Teams2 />
        <Authentication2 />
        <OAuth2 />
      </>
    )
  }
}

export default Endpoints
