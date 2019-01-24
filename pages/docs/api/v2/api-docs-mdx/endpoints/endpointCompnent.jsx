import Endpoint from '~/components/api/endpoint'
import { GenericLink, HelpLink } from '~/components/text/link'
import spec from './spec.json'

const verb = 'post'
const mySpec = spec['/v2/domains'][verb]

const isRequired = (schema, fieldName) => {
  return !((schema.required || []).indexOf(fieldName) === -1)
}

const requestTable = schema => {
  return (
    <div className="jsx-4128209634 table-container">
      <table className="jsx-4128209634 table">
        <thead>
          <tr aria-roledescription="row" className="row">
            <th>
              <div>Key</div>
            </th>

            <th className="head-cell">
              <div>
                {' '}
                <HelpLink href="#api-basics/types" hasIcon>
                  Type
                </HelpLink>
              </div>
            </th>
            <th>
              <div>Required</div>
            </th>
            <th>
              <div>Description</div>
            </th>
          </tr>
        </thead>
        <tbody className="jsx-1134696997 ">
          {Object.keys(schema.properties).map(key => {
            const property = schema.properties[key]

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
                      <span className="jsx-1042203751">{property.type}</span>
                    </a>
                  </div>
                </td>
                <td className="table-cell">
                  <div>{property.description}</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const responseTable = schema => (
  <div className="jsx-4128209634 table-container">
    <table className="jsx-4128209634 table">
      <thead>
        <tr aria-roledescription="row" className="row">
          <th>
            <div>Key</div>
          </th>

          <th className="head-cell">
            <div>
              {' '}
              <HelpLink href="#api-basics/types" hasIcon>
                Type
              </HelpLink>
            </div>
          </th>
          <th>
            <div>Description</div>
          </th>
        </tr>
      </thead>
      <tbody className="jsx-1134696997 ">
        {schema.properties
          ? Object.keys(schema.properties).map(key => {
              const property = schema.properties[key]

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
                        <span className="jsx-1042203751">{property.type}</span>
                      </a>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>{property.description}</div>
                  </td>
                </tr>
              )
            })
          : null}
      </tbody>
    </table>
  </div>
)

const base = specObj => {
  const operationId = specVerb.operationId.split('.')[0]
  return (
    <div style={{ border: '1px solid black' }}>
      <span id="endpoints/domains" className="jsx-3034944913" />
      <a href="#endpoints/domains">Domains</a>{' '}
      <h3 class="jsx-2454259911">
        /*TODO: Need to define the format of operationId*/
        <a href={'#endpoints/domains/' + operationId} class="jsx-2892434432">
          {operationId}
        </a>
      </h3>
      <Endpoint method={verb.toLocaleUpperCase()} url={'/v2/domains'} />
      <p className="jsx-3121034208">{specVerb.description}</p>
      {!!specVerb.requestBody ? null : (
        <div>
          <h4 className="jsx-4140571023 ">Request Parameters</h4>
          {requestTable(
            specVerb.requestBody.content['application/json'].schema
          )}
        </div>
      )}
      {
        <div>
          <h4 className="jsx-4140571023 ">Response Parameters</h4>
          {requestTable(
            specVerb.responses['200'].content['application/json'].schema
          )}
        </div>
      }
      {responseTable(specVerb)}
    </div>
  )
}

const EndpointComponent = (method, url) => {
  let specObj = spec[url][method.toString().toLowerCase()]
  base(specObj)
}

export default Domains

{
  /* <div>
       {Object.keys(Spec).map(url => {
       return Object.keys(Spec[url]).map(action => {
       return (
       <div>
       <div>{Spec[url][action]['operationId']}</div>
       <Endpoint method={action.toUpperCase()} url={url} />
       </div>
       )
       })
       })}
       ---------
       </div> */
}
