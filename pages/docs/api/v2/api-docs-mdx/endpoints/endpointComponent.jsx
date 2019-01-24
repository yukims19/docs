import Endpoint from '~/components/api/endpoint'
import { GenericLink, HelpLink } from '~/components/text/link'
import spec from './entireSpec.json'

const getRefObject = refPath => {
  console.log(refPath)
  let object = spec
  refPath.split('/').forEach(e => {
    e === '#' ? null : (object = object[e])
  })
  return object
}

let tableHeader = fieldNames => {
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
        {fieldNames.length === 4 ? (
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

/*TODO: need to handle $ref type object -vs- non-object*/
let tableBody = (properties, requiredFieldArray) => {
  return (
    <tbody className="jsx-1134696997 ">
      {Object.keys(properties).map(key => {
        let param = properties[key]
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
                  <span className="jsx-1042203751">
                    {/*TODO: Uppercase & nestedRef & correct data type*/}
                    {param.type
                      ? param.type
                      : param['$ref']
                        ? /*!!!Not sure if the data structure is correct*/
                          getRefObject(param['$ref']).enum
                          ? 'Enum'
                          : getRefObject(param['$ref']).type
                        : null}
                  </span>
                </a>
              </div>
            </td>
            {requiredFieldArray ? (
              <td className="table-cell">
                <div>{requiredFieldArray.includes(key) ? 'Yes' : 'No'}</div>
              </td>
            ) : null}

            <td className="table-cell">
              <div>
                {param.description
                  ? param.description
                  : param['$ref']
                    ? getRefObject(param['$ref']).description
                    : null}
              </div>
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

const requestTable = schema => (
  <div className="jsx-4128209634 table-container">
    <table className="jsx-4128209634 table">
      {tableHeader(['Key', 'Type', 'Required', 'Description'])}
      {!!schema['$ref']
        ? tableBody(getRefObject(schema['$ref']).properties, schema.required)
        : !!schema['properties']
          ? tableBody(schema['properties'], schema.required)
          : null}
    </table>
  </div>
)

const responseTable = schema => (
  <div className="jsx-4128209634 table-container">
    <table className="jsx-4128209634 table">
      {tableHeader(['Key', 'Type', 'Description'])}
      {!!schema['$ref']
        ? tableBody(getRefObject(schema['$ref']).properties)
        : !!schema['properties']
          ? tableBody(schema['properties'])
          : null}
    </table>
  </div>
)

/*
   !!specObj.responses['200'].content[
   'application/json'
   ].schema['properties'] &&
   Object.keys(
   specObj.responses['200'].content['application/json'].schema[
   'properties'
   ]
   ) > 0 ?
 */
const component = (specObj, method, url) => {
  const operationId = specObj.operationId
    .replace(/([A-Z])/g, ' $1')
    .replace(/V[0-9]/g, '')
    .toLowerCase()
    .trim()

  return (
    <div style={{ border: '1px solid black' }}>
      <h3 className="jsx-2454259911">
        {/*TODO: Need to define the format of operationId*/}
        <a
          href={'#endpoints/domains/' + operationId.replace(/\s+/g, '-')}
          className="jsx-2892434432"
        >
          {operationId.charAt(0).toUpperCase() + operationId.slice(1)}
        </a>
      </h3>
      <Endpoint method={method} url={url} />
      <p className="jsx-3121034208">{specObj.description}</p>
      {!specObj.requestBody ? null : (
        <div>
          <h4 className="jsx-4140571023 ">Request Parameters</h4>
          {requestTable(specObj.requestBody.content['application/json'].schema)}
        </div>
      )}
      {!specObj.responses ? null : (
        <div>
          <h4 className="jsx-4140571023 ">Response Parameters</h4>
          {responseTable(
            specObj.responses[200].content['application/json'].schema
          )}
        </div>
      )}
    </div>
  )
}

const EndpointComponent = ({ method, url }) => {
  let specUrl = url.replace(/:(\w+)/g, '{$1}')
  let specObj =
    spec.paths && spec.paths[specUrl]
      ? spec.paths[specUrl][method.toLowerCase()]
      : null
  return specObj ? component(specObj, method, url) : null
}

export default EndpointComponent
