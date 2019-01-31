import { UL, LI } from '~/components/list'

class CommentBox extends React.Component {
  constructor(props) {
    super(props)
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
