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
const getType = param => {
  if (param.type) {
    if (param.type === 'array') {
      let item
      if (!!param.items.type) {
        let rawItem = param.items.type
        item = rawItem.charAt(0).toUpperCase() + rawItem.slice(1)
      } else {
        let pathArray = param.items['$ref'].split('/')
        let rawItem = pathArray[pathArray.length - 1]
        item = (rawItem.charAt(0).toUpperCase() + rawItem.slice(1)).replace(
          /(-)/g,
          ' '
        )
      }
      return 'List<' + item + '>'
    } else {
      return param.type.charAt(0).toUpperCase() + param.type.slice(1)
    }
  } else if (param['ref']) {
    let refObj = getRefObject(param['$ref'])
    return !!refObj.enum
      ? 'Enum<' + refObj.enum.join('|') + '>'
      : refObj.type.charAt(0).toUpperCase() + refObj.type.slice(1)
  } else {
    return null
  }
}

const tableHeader = fieldNames => {
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

const tableBody = (properties, requiredFieldArray) => {
  if (properties.type === 'array') {
    return (
      <tbody
        className="jsx-1134696997 "
        style={{ backgroundColor: '#f44336a1' }}
      >
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
              <span className="jsx-3894149877">{properties.description}</span>
            </div>
          </td>
        </tr>
      </tbody>
    )
  } else {
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
                    <span className="jsx-1042203751">{getType(param)}</span>
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
}

const requestTable = schema => {
  if (
    (!!schema.properties && Object.keys(schema.properties).length > 0) ||
    !!schema['$ref'] > 0
  ) {
    return (
      <div>
        <h4 className="jsx-4140571023 ">Request Parameters</h4>
        <div className="jsx-4128209634 table-container">
          <table className="jsx-4128209634 table">
            {tableHeader(['Key', 'Type', 'Required', 'Description'])}
            {!!schema['$ref']
              ? tableBody(
                  getRefObject(schema['$ref']).properties,
                  schema.required
                )
              : !!schema['properties']
                ? tableBody(schema['properties'], schema.required)
                : tableBody(schema)}
          </table>
        </div>
      </div>
    )
  } else {
    return null
  }
}

const responseTable = schema => {
  if (
    (!!schema.properties && Object.keys(schema.properties).length) ||
    !!schema['$ref'] > 0
  ) {
    return (
      <div>
        <h4 className="jsx-4140571023 ">Response Parameters</h4>
        <div className="jsx-4128209634 table-container">
          <table className="jsx-4128209634 table">
            {tableHeader(['Key', 'Type', 'Description'])}
            {!!schema['$ref']
              ? tableBody(getRefObject(schema['$ref']).properties)
              : !!schema['properties']
                ? tableBody(schema['properties'])
                : tableBody(schema)}
          </table>
        </div>
      </div>
    )
  } else {
    return null
  }
}

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
      {!specObj.requestBody
        ? null
        : requestTable(specObj.requestBody.content['application/json'].schema)}
      {!specObj.responses
        ? null
        : responseTable(
            specObj.responses[200].content['application/json'].schema
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

export { EndpointComponent as default, ItemDetail }
