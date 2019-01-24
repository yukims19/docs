import Endpoint from '~/components/api/endpoint'
import { GenericLink, HelpLink } from '~/components/text/link'
import { Code, InlineCode } from '~/components/code'
import H1 from '~/components/text/h1'
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

const CodeMarkdown = ({ language, value }) => (
  <Code lang={language}>{value}</Code>
)

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
  code: CodeMarkdown,
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
  return capitalize(refName).replace(/\W+/g, ' ')
}

const resolveRefObject = (spec, refPath) => {
  return spec.components.schemas[getRefName(refPath)]
}

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
  } else if (schema['ref']) {
    let refSchema = resolveRefObject(spec, schema['$ref'])
    const isEnum = !!refSchema.enum
    const enumValues = isEnum ? refSchema.enum.join('|') : []
    return isEnum ? `Enum<${enumValues}>` : capitalize(refSchema.type)
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
              <div>{propertyDescription}</div>
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
const operationIdFriendlyName = operationId =>
  operationId
    .replace(/([A-Z])/g, ' $1')
    .replace(/V[0-9]/g, '')
    .toLowerCase()
    .trim()

const operationDetails = (spec, operation, method, url) => {
  /* FIXME: Need to normalize the capitalization of operationId */
  const operationFriendlyName = operationIdFriendlyName(operation.operationId)
  const operationAnchor =
    '#endpoints/domains/' + operationFriendlyName.replace(/\s+/g, '-')

  const requestBodySchema =
    operation.requestBody &&
    operation.requestBody.content['application/json'].schema

  const successResponseBodySchema =
    operation.responses[200] &&
    operation.responses[200].content['application/json'].schema

  return (
    <div style={{ border: '1px solid black' }}>
      <h3 className="jsx-2454259911">
        <a href={operationAnchor} className="jsx-2892434432">
          {capitalize(operationFriendlyName)}
        </a>
      </h3>
      <Endpoint method={method} url={url} />
      <Markdown source={operation.description} renderers={mdxComponents} />
      {requestBodySchema && objectTable('request', spec, requestBodySchema)}
      {successResponseBodySchema &&
        objectTable('response', spec, successResponseBodySchema)}
    </div>
  )
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
      <h4 className="jsx-4140571023 ">{itemName}</h4>
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

const zeitUrlPathToOpenapiUrl = url => url.replace(/:(\w+)/g, '{$1}')

const Operation = ({ spec, method, url }) => {
  const openapiUrl = zeitUrlPathToOpenapiUrl(url)
  const httpVerb = method.toLowerCase()
  // pathObj will have http methods as keys in an openapi spec
  const openapiPathObj = spec.paths && spec.paths[openapiUrl]
  const operation = openapiPathObj && openapiPathObj[httpVerb]

  return operation ? (
    operationDetails(spec, operation, method, url)
  ) : (
    <h1 style={{ backgroundColor: fixmeRed }}>
      Missing operation definition for {`${url}.${method}`}
    </h1>
  )
}

export { Operation as default, ItemDetail }
