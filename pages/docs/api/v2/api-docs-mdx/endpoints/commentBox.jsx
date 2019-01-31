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

class CommentBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
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

  render() {
    console.log('commentbox', this.props)
    return (
      <Card style={{ backgroundColor: ' #fafafa' }}>
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
      </Card>
    )
  }
}

export default CommentBox
