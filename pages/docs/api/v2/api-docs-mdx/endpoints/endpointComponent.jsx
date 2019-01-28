import Endpoint from '~/components/api/endpoint'
import { GenericLink, HelpLink } from '~/components/text/link'
import { Code, InlineCode } from '~/components/code'
import H2 from '~/components/text/h2'
import H3 from '~/components/text/h3'
import H4 from '~/components/text/h4'
import H5 from '~/components/text/h5'
import H6 from '~/components/text/h6'
import { UL, LI } from '~/components/list'
import { P } from '~/components/text/paragraph'
import Strong from '~/components/text/strong'
import Quote from '~/components/text/quote'
import Markdown from 'react-markdown'
import Example from '~/components/example'
import Request from '~/components/api/request'
import Heading from '~/components/text/linked-heading'

const zeitUrlPathToOpenapiUrl = url => url.replace(/:(\w+)/g, '{$1}')
// Copy/pasted from docs.js
class DocH3 extends React.Component {
  //}= ({ isEditting, handleClick, handleSave, rowTitle, children }) => {
  constructor(props) {
    super(props)
    this.state = { newTitle: this.props.rowTitle }
  }

  updateNewTitle(title) {
    this.setState({ newTitle: title })
  }

  render() {
    return this.props.isEditting ? (
      <div style={{ backgroundColor: '#cfcfcf' }}>
        <textarea
          style={{ width: '100%' }}
          onChange={e => this.updateNewTitle(e.target.value)}
        >
          {this.state.newTitle}
        </textarea>
        <button
          type="submit"
          onClick={_e => this.props.handleSave(this.state.newTitle)}
        >
          Save
        </button>
        <hr />
        <small>Live View:</small>
        <H3>
          {capitalize(this.props.operationIdFriendlyName(this.state.newTitle))}
        </H3>
      </div>
    ) : (
      <div onDoubleClick={e => this.props.handleClick()}>
        <Heading lean offsetTop={175}>
          <H3>{this.props.children}</H3>
        </Heading>
        <style jsx>
          {`
            div {
              margin: 40px 0 0 0;
            }
          `}
        </style>
      </div>
    )
  }
}

const DocH4 = ({ children }) => (
  <div>
    <Heading lean offsetTop={175}>
      <H4>{children}</H4>
    </Heading>
    <style jsx>
      {`
        div {
          margin: 40px 0 0 0;
        }
      `}
    </style>
  </div>
)

const CodeMarkdown = ({ language, value }) => (
  <Code lang={language}>{value}</Code>
)

class DocMarkdown extends React.Component {
  constructor(props) {
    super(props)
    this.state = { newDescription: this.props.rowDescription }
  }

  updateNewDescription(description) {
    this.setState({ newDescription: description })
  }

  render() {
    return this.props.isEditting ? (
      <div style={{ backgroundColor: '#cfcfcf' }}>
        <textarea
          style={{ width: '100%' }}
          onChange={e => this.updateNewDescription(e.target.value)}
        >
          {this.state.newDescription}
        </textarea>
        <button
          type="submit"
          onClick={_e => this.props.handleSave(this.state.newDescription)}
        >
          Save
        </button>
        <hr />
        <small>Live View:</small>
        <Markdown
          source={this.state.newDescription}
          renderers={mdxComponents}
        />
      </div>
    ) : (
      <div onDoubleClick={e => this.props.handleClick()}>
        <Markdown source={this.props.children} renderers={mdxComponents} />
      </div>
    )
  }
}

const Headings = ({ level, children }) => {
  switch (level) {
    case 1:
      // This helps us put the title on above the custom buttons
      return null
    case 2:
      return <H2>{children}</H2>
    case 3:
      return <H3>{children}</H3>
    case 4:
      return <H4>{children}</H4>
    case 5:
      return <H5>{children}</H5>
    case 6:
      return <H6>{children}</H6>
    default:
      return <p>{children}</p>
  }
}

const mdxComponents = {
  paragraph: P,
  strong: Strong,
  list: UL,
  listItem: LI,
  heading: Headings,
  inlineCode: InlineCode,
  link: GenericLink,
  blockquote: Quote
}

const capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const getRefName = ref => {
  return ref.split('/').pop()
}

const getRefFriendlyName = ref => {
  let refName = getRefName(ref)
  // turn "deployment-ready-state" => "Deployment ready state"
  return capitalize(refName)
    .replace(/\W+/g, ' ')
    .split(' ')
    .map(capitalize)
    .join('')
}

const resolveRefObject = (spec, refPath) => {
  return spec.components.schemas[getRefName(refPath)]
}

const scalarTypes = ['string', 'integer', 'boolean']

const getType = (spec, schema) => {
  if (schema.type) {
    if (schema.type === 'array') {
      let item
      if (!!schema.items.type) {
        item = capitalize(schema.items.type)
      } else if (!!schema.items['$ref']) {
        item = getRefFriendlyName(schema.items['$ref'])
      }
      return `List<${item}>`
    } else {
      return capitalize(schema.type)
    }
  } else if (schema['$ref']) {
    let refName = getRefFriendlyName(schema['$ref'])
    let refSchema = resolveRefObject(spec, schema['$ref'])

    const isEnum = !!refSchema.enum
    const enumValues = isEnum ? refSchema.enum.join('|') : []

    /* If a ref is a scalar, it must have been given a special name for a reason,
     so use that name */
    const isScalar = !isEnum && scalarTypes.indexOf(refSchema.type) > -1

    const typeName = isEnum
      ? `Enum<${refName}>`
      : capitalize(isScalar ? refName : refSchema.type)

    return typeName
  } else {
    return null
  }
}

const tableHeader = fieldNames => {
  const hasRequiredFields = fieldNames.length === 4

  return (
    <thead>
      <tr aria-roledescription="row" className="row">
        <th className="head-cell">
          <div>{fieldNames[0]}</div>
        </th>
        <th className="head-cell">
          <div>
            {' '}
            <HelpLink href="#api-basics/types" hasIcon>
              {fieldNames[1]}
            </HelpLink>
          </div>
        </th>
        {hasRequiredFields ? (
          <th className="head-cell">
            <div> {fieldNames[2]}</div>
          </th>
        ) : null}
        <th className="head-cell">
          <div> {fieldNames[fieldNames.length - 1]}</div>
        </th>
      </tr>
    </thead>
  )
}

const fixmeRed = '#f44336a1'

const specialCaseListTableBody = schema => {
  return (
    <tbody className="jsx-1134696997 " style={{ backgroundColor: fixmeRed }}>
      <tr aria-roledescription="row" className="row">
        <td className="table-cell">
          <div>
            <span className="jsx-3894149877">key_missing</span>
          </div>
        </td>
        <td className="table-cell">
          <div>
            <span className="jsx-3894149877">Array</span>
          </div>
        </td>
        <td className="table-cell">
          <div>
            <span className="jsx-3894149877">{schema.description}</span>
          </div>
        </td>
      </tr>
    </tbody>
  )
}

const tableBody = (spec, properties, requiredFieldNames) => {
  return (
    <tbody className="jsx-1134696997 ">
      {Object.keys(properties).map(key => {
        const property = properties[key]
        const propertyType = getType(spec, property)
        const propertyDescription = property.description
          ? property.description
          : property['$ref']
            ? resolveRefObject(spec, property['$ref']).description
            : null

        const requiredColumn = Array.isArray(requiredFieldNames) ? (
          <td className="table-cell">
            <div>{requiredFieldNames.includes(key) ? 'Yes' : 'No'}</div>
          </td>
        ) : null

        return (
          <tr aria-roledescription="row" className="row">
            <td className="table-cell">
              <div>
                <span className="jsx-3894149877">{key}</span>
              </div>
            </td>

            <td className="table-cell">
              <div>
                <a href="#api-basics/types" className="jsx-1042203751 ">
                  <span className="jsx-1042203751">{propertyType}</span>
                </a>
              </div>
            </td>

            {requiredColumn}

            <td className="table-cell">
              <DocMarkdown
                isEditting={false}
                handleClick={() => null}
                rowTitle={null}
                handleSave={value => null}
              >
                {propertyDescription}
              </DocMarkdown>
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

const objectTable = (tableType, spec, schema) => {
  /* Request table type is special cf response/data-component table, it has
  an additional 'Required' column
  */
  const keys =
    tableType === 'request'
      ? ['Key', 'Type', 'Required', 'Description']
      : ['Key', 'Type', 'Description']

  const schemaIsRef = !!schema['$ref']
  const schemaIsObject =
    // We have some cases where the schema has properties, but it's an empty object
    (!!schema.properties && Object.keys(schema.properties).length > 0) ||
    schemaIsRef

  const schemaObject = schemaIsRef
    ? resolveRefObject(spec, schema['$ref'])
    : schema

  /**
  If the schema is already an object, pluck its properties for rendering a table.
  If it's a reference, follow it to the actual object and pluck *its* properties
  */
  const schemaProperties = schemaObject && schemaObject.properties

  /* Handle the special case where the table is given a non-object type,
  e.g. the api response has a top-level array returned. These should be
  normalized inside the api implementation in the future, and this special-case
  removed */
  const isSpecialCase = !schemaProperties

  if (schemaIsObject) {
    return (
      <div>
        <h4 className="jsx-4140571023 ">{`${capitalize(
          tableType
        )} Parameters`}</h4>
        <div className="jsx-4128209634 table-container">
          <table className="jsx-4128209634 table">
            {tableHeader(keys)}
            {!!isSpecialCase
              ? specialCaseListTableBody(spec, schema)
              : tableBody(spec, schemaProperties, schemaObject.required)}
          </table>
        </div>
      </div>
    )
  } else {
    return null
  }
}

// "  RemoveUserFromTeamV1  " => "remove user from team"

class Clock extends React.Component {
  constructor(props) {
    super(props)
    this.state = { date: new Date() }
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}

class OperationDetails extends React.Component {
  //(this.props.spec, operation, method, url)
  constructor(props) {
    super(props)
    this.state = {
      pendingChanges: 0,
      isH3Editting: false,
      isDescriptionEditting: false
    }

    this.contentType = 'application/json'
    /* FIXME: Need to normalize the capitalization of operationId */
    this.operationFriendlyName = this.operationIdFriendlyName(
      this.props.operation.operationId
    )

    this.operationAnchor =
      '#endpoints/domains/' + this.operationFriendlyName.replace(/\s+/g, '-')

    this.requestBody =
      this.props.operation.requestBody &&
      this.props.operation.requestBody.content[this.contentType]

    this.requestBodySchema = this.requestBody && this.requestBody.schema

    this.successResponseBody =
      this.props.operation.responses[200] &&
      this.props.operation.responses[200].content[this.contentType]

    this.successResponseBodySchema =
      this.successResponseBody && this.successResponseBody.schema

    this.requestExamples = (this.requestBody && this.requestBody.examples) || {}
    this.successResponseExamples =
      (this.successResponseBody && this.successResponseBody.examples) || {}
  }

  operationIdFriendlyName(operationId) {
    return operationId
      .replace(/([A-Z])/g, ' $1')
      .replace(/V[0-9]/g, '')
      .toLowerCase()
      .trim()
  }

  toggleEditMood(field) {
    console.log('clicked', field)
    switch (field) {
      case 'title':
        this.setState({ isH3Editting: !this.state.isH3Editting })
        break
      case 'description':
        this.setState({
          isDescriptionEditting: !this.state.isDescriptionEditting
        })
        break
      default:
        console.log('Wrong Field')
    }
  }

  modifySpec(newSpec, field, value) {
    console.log(
      'DOES THIS GET CONSOLE',
      field,
      value,
      this.props.url,
      this.props.method
    )

    switch (field) {
      case 'title':
        newSpec.paths[zeitUrlPathToOpenapiUrl(this.props.url)][
          this.props.method.toLowerCase()
        ].operationId = value
        this.setState({ isH3Editting: false })
        return newSpec

      case 'description':
        newSpec.paths[zeitUrlPathToOpenapiUrl(this.props.url)][
          this.props.method.toLowerCase()
        ].description = value

        this.setState({
          isDescriptionEditting: false
        })
        return newSpec

      default:
        console.log('Unrecognized Field to update: break' + field)
        return newSpec
    }
  }

  render() {
    const { updateSpec } = this.props

    return (
      <div style={{ border: '1px solid black' }}>
        <DocH3
          isEditting={this.state.isH3Editting}
          handleClick={() => this.toggleEditMood('title')}
          rowTitle={
            this.props.spec.paths[zeitUrlPathToOpenapiUrl(this.props.url)][
              this.props.method.toLowerCase()
            ].operationId
          }
          handleSave={value =>
            updateSpec('Title updated', spec => {
              return this.modifySpec(spec, 'title', value)
            })
          }
          operationIdFriendlyName={this.operationIdFriendlyName}
        >
          {capitalize(
            this.operationIdFriendlyName(
              this.props.spec.paths[zeitUrlPathToOpenapiUrl(this.props.url)][
                this.props.method.toLowerCase()
              ].operationId
            )
          )}
        </DocH3>
        <Endpoint method={this.props.method} url={this.props.url} />
        <DocMarkdown
          isEditting={this.state.isDescriptionEditting}
          handleClick={() => this.toggleEditMood('description')}
          rowDescription={
            this.props.spec.paths[zeitUrlPathToOpenapiUrl(this.props.url)][
              this.props.method.toLowerCase()
            ].description
          }
          handleSave={value =>
            updateSpec('Description updated', spec =>
              this.modifySpec(spec, 'description', value)
            )
          }
        >
          {this.props.operation.description}
        </DocMarkdown>
        {this.requestBodySchema &&
          objectTable('request', this.props.spec, this.requestBodySchema)}
        {this.successResponseBodySchema &&
          objectTable(
            'response',
            this.props.spec,
            this.successResponseBodySchema
          )}
        {Object.keys(this.requestExamples).map(exampleName => {
          const exampleRequest = this.requestExamples[exampleName]
          const exampleResponse = this.successResponseExamples[exampleName]

          return (
            <Example>
              <span>
                <DocMarkdown
                  isEditting={false}
                  handleClick={() => this.toggleEditMood('description')}
                  rowTitle={
                    this.props.spec.paths[
                      zeitUrlPathToOpenapiUrl(this.props.url)
                    ][this.props.method.toLowerCase()].description
                  }
                  handleSave={value =>
                    updateSpec('Description updated', spec =>
                      this.modifySpec('description', value)
                    )
                  }
                >
                  {(exampleRequest.summary || 'Example request') + ':'}
                  this.props.operation.description
                </DocMarkdown>
              </span>
              <Request
                url={`https://api.zeit.co${this.props.url}`}
                method={this.props.method.toUpperCase()}
                headers={{
                  Authorization: `Bearer ${
                    this.props.testingToken
                      ? this.props.testingToken.token
                      : '$TOKEN'
                  }`,
                  'Content-Type': this.contentType
                }}
                body={exampleRequest.value}
              />
              {!exampleResponse ? null : (
                <>
                  <span>
                    <DocMarkdown
                      isEditting={false}
                      handleClick={() => this.toggleEditMood('description')}
                      rowTitle={
                        this.props.spec.paths[
                          zeitUrlPathToOpenapiUrl(this.props.url)
                        ][this.props.method.toLowerCase()].description
                      }
                      handleSave={value =>
                        updateSpec('Description updated', spec =>
                          this.modifySpec('description', value)
                        )
                      }
                    >
                      {(exampleResponse.summary || 'Example response') + ':'}
                    </DocMarkdown>
                  </span>
                  <Code lang="json">
                    {JSON.stringify(exampleResponse.value, null, 2)}
                  </Code>
                </>
              )}
            </Example>
          )
        })}
      </div>
    )
  }
}

const ItemDetail = ({ itemName, description }) => {
  let item = itemName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .trim()
  console.log(item)
  console.log(spec.components.schemas[item].properties)
  return (
    <div>
      <DocH4>{itemName}</DocH4>
      {description ? <p>{description}</p> : null}
      <div className="jsx-4128209634 table-container">
        <table className="jsx-4128209634 table">
          {tableHeader(['Key', 'Type', 'Description'])}
          {tableBody(spec.components.schemas[item].properties)}
        </table>
      </div>
    </div>
  )
}

/* Convert a Zeit-docs style url to the openapi path name, e.g.
"/v1/teams/:id/members/:userId" => "/v1/teams/{id}/members/{userId}"
*/

const Operation = props => {
  const { spec, method, url, updateSpec } = props
  const openapiUrl = zeitUrlPathToOpenapiUrl(url)
  const httpVerb = method.toLowerCase()
  // pathObj will have http methods as keys in an openapi spec
  const openapiPathObj = spec.paths && spec.paths[openapiUrl]
  const operation = openapiPathObj && openapiPathObj[httpVerb]

  return operation ? (
    <OperationDetails
      spec={spec}
      operation={operation}
      method={method}
      url={url}
      updateSpec={updateSpec}
    />
  ) : (
    <h1 style={{ backgroundColor: fixmeRed }}>
      Missing operation definition for {`${url}.${method}`}
    </h1>
  )
}

export { Operation as default, ItemDetail }
