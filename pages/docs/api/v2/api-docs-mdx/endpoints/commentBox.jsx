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
      <div>
        <div style={{ border: '1px solid black' }}>
          <UL>
            {this.props.prInfo.timeline.nodes.map(
              node => (node.body ? <li>{node.body}</li> : null)
            )}
            <LI>Comment 1</LI>
          </UL>
          <textarea />
        </div>
      </div>
    )
  }
}

export default CommentBox
