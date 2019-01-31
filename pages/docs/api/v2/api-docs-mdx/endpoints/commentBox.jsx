import { UL, LI } from '~/components/list'
import Card from '~/components/card'
import { Code } from '~/components/text/code'
import Example from '~/components/example'
import ChatCount from '~/components/chat-count'

const commentPRMutation = `mutation commentPR($body:String!, $subjectId: String!){
  gitHub {
    addComment(
      input: {
        body: $body
        subjectId: $subjectId
      }
    ) {
      clientMutationId
    }
  }
}
`
const getSinglePRQuery = `query singlePullRequests(
  $name: String!
  $owner: String!
  $number: Int!
) {
  gitHub {
    repository(name: $name, owner: $owner) {
      pullRequest(number: $number) {
        id
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
      }
    }
  }
}
`

let commentBoxIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="64"
    height="64"
    viewBox="0 0 224 224"
    style={{ fill: '#000000' }}
  >
    <g
      fill="none"
      fill-rule="nonzero"
      stroke="none"
      stroke-width="1"
      stroke-linecap="butt"
      stroke-linejoin="miter"
      stroke-miterlimit="10"
      stroke-dasharray=""
      stroke-dashoffset="0"
      font-family="none"
      font-weight="none"
      font-size="none"
      text-anchor="none"
      style={{ mixBlendMode: 'normal' }}
    >
      <path d="M0,224v-224h224v224z" fill="none" />
      <g id="Layer_1">
        <g>
          <g fill="#000000">
            <g>
              <path d="M3.45625,112c0,-59.9375 48.60625,-108.54375 108.54375,-108.54375c59.9375,0 108.54375,48.60625 108.54375,108.54375c0,59.9375 -48.60625,108.54375 -108.54375,108.54375c-59.9375,0 -108.54375,-48.60625 -108.54375,-108.54375z" />
            </g>
          </g>
          <g>
            <g fill="#ffffff">
              <g>
                <path d="M180.55625,137.025c0,7.91875 -6.3875,14.30625 -14.30625,14.30625h-108.5c-7.91875,0 -14.30625,-6.3875 -14.30625,-14.30625v-63.175c0,-7.91875 6.3875,-14.30625 14.30625,-14.30625h108.5c7.91875,0 14.30625,6.3875 14.30625,14.30625z" />
              </g>
              <g>
                <path d="M147.4375,170.58125c-1.1375,1.1375 -2.93125,1.1375 -4.06875,0l-13.69375,-19.38125c-1.1375,-1.1375 -1.1375,-2.93125 0,-4.06875h31.5c1.1375,1.1375 1.1375,2.93125 0,4.06875z" />
              </g>
            </g>
            <g fill="#333333">
              <g>
                <path d="M159.64375,83.825c0,2.8875 -2.31875,5.20625 -5.20625,5.20625h-85.225c-2.8875,0 -5.20625,-2.31875 -5.20625,-5.20625v0c0,-2.8875 2.31875,-5.20625 5.20625,-5.20625h85.26875c2.84375,0.04375 5.1625,2.3625 5.1625,5.20625z" />
              </g>
              <g>
                <path d="M159.64375,104.65c0,2.8875 -2.31875,5.20625 -5.20625,5.20625h-85.225c-2.8875,0 -5.20625,-2.31875 -5.20625,-5.20625v0c0,-2.8875 2.31875,-5.20625 5.20625,-5.20625h85.26875c2.84375,0 5.1625,2.31875 5.1625,5.20625z" />
              </g>
              <g>
                <path d="M159.64375,125.43125c0,2.8875 -2.31875,5.20625 -5.20625,5.20625h-85.225c-2.8875,0 -5.20625,-2.31875 -5.20625,-5.20625v0c0,-2.8875 2.31875,-5.20625 5.20625,-5.20625h85.26875c2.84375,0 5.1625,2.31875 5.1625,5.20625z" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>
)

class CommentBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isCompact: true,
      comment: null,
      commentsNodes: this.props.prInfo.comments.nodes
    }
  }

  updateComment(value) {
    this.setState({ comment: value })
  }

  commentPR(auth, repoOwner, repoName, body, focusedPR, graphqler) {
    graphqler(auth, commentPRMutation, {
      body: body,
      subjectId: focusedPR.id
    }).then(data => {
      graphqler(auth, getSinglePRQuery, {
        owner: repoOwner,
        name: repoName,
        number: this.props.prInfo.number
      }).then(json => {
        console.log('comment return data:', json)
        if (json.errors) {
          alert('Error!! Could not comment.')
        } else {
          this.setState({
            comment: '',
            commentsNodes:
              json.data.gitHub.repository.pullRequest.comments.nodes
          })
        }
      })
    })
  }

  toggleCommentBox() {
    this.setState({ isCompact: !this.state.isCompact })
  }

  componentDidUpdate(prevProps) {
    if (this.props.focusedPR !== prevProps.focusedPR) {
      this.setState({
        commentsNodes: this.props.prInfo.comments.nodes
      })
    }
  }

  render() {
    return (
      <div>
        {this.state.isCompact ? (
          <div onClick={_e => this.toggleCommentBox()}>{commentBoxIcon}</div>
        ) : (
          <Card
            style={{ backgroundColor: ' #fafafa' }}
            onClick={e => {
              e.preventDefault()
            }}
          >
            <img
              onClick={_e => this.toggleCommentBox()}
              style={{
                width: '14px',
                height: '14px',
                position: 'absolute',
                top: '34px',
                right: '8px'
              }}
              src="https://img.icons8.com/material/24/000000/multiply.png"
            />
            <h3
              style={{
                marginTop: '0px'
              }}
            >
              PR Comments
            </h3>
            <div
              style={{
                backgroundColor: 'white',
                padding: '16px'
              }}
            >
              {this.state.commentsNodes.map(
                node =>
                  node.bodyText ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}
                    >
                      <img
                        src={node.author.avatarUrl}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%'
                        }}
                      />
                      <p
                        style={{
                          border: '1px solid #cfcfcf',
                          borderRadius: '3px',
                          padding: '7px 15px',
                          marginLeft: '8px'
                        }}
                      >
                        {node.bodyText}
                      </p>
                    </div>
                  ) : null
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  borderTop: ' 1px solid #eaeaea'
                }}
              >
                <input
                  value={this.state.comment}
                  onChange={e => this.updateComment(e.target.value)}
                  style={{
                    width: '100%',
                    height: '24px',
                    border: 'none',
                    outline: 'none',
                    borderRadius: '3px',
                    fontSize: '14px',
                    padding: '8px 4px 0px 4px',
                    resize: 'none'
                  }}
                  onKeyDown={e => {
                    console.log(e.keyCode)
                    e.keyCode === 13
                      ? this.commentPR(
                          this.props.auth,
                          this.props.repoOwner,
                          this.props.repoName,
                          this.state.comment,
                          this.props.focusedPR,
                          this.props.graphqler
                        )
                      : null
                  }}
                />
                <button
                  onClick={_e =>
                    this.commentPR(
                      this.props.auth,
                      this.props.repoOwner,
                      this.props.repoName,
                      this.state.comment,
                      this.props.focusedPR,
                      this.props.graphqler
                    )
                  }
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    height: '24px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  SUBMIT
                </button>
              </div>
            </div>
            <a
              onClick={() => this.props.showOriginalDoc()}
              style={{
                padding: '4px 0px',
                marginTop: '4px',
                textDecoration: 'underline'
              }}
            >
              Restore Original Doc
            </a>
          </Card>
        )}
      </div>
    )
  }
}

export default CommentBox
