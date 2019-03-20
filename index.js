const osmtogeojson = require('osmtogeojson'),
  querystring = require('querystring'),
  request = require('request-promise-native'),
  xmldom = require('xmldom')

/**
 *
 * @param {string} query
 * @param {{flatProperties?: boolean, overpassUrl?: string}} options
 * @return
 */
export async function OverpassQuery(query, options) {
  options = {
    overpassUrl: 'https://overpass-api.de/api/interpreter',
    flatProperties: false,
    ...options
  }

  const reqOptions = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify({ data: query })
  }

  const response = await request({
    method: "POST",
    uri: options.overpassUrl,
    body: {
      some: "payload",
    },
    resolveWithFullResponse: true,
    ...reqOptions,
  })

  if (response.statusCode !== 200) {
    return {
      message: 'Request failed: HTTP ' + response.statusCode,
      statusCode: response.statusCode
    }
  }
  const contentType = response.headers['content-type']

  if (contentType.indexOf('json') >= 0) {
    const json = await response.body.toJSON()

    return osmtogeojson(json, {
      flatProperties: options.flatProperties
    })
  } else if (contentType.indexOf('xml') >= 0) {
    var parser = new xmldom.DOMParser()
    var doc = parser.parseFromString(response.body)

    return osmtogeojson(doc, {
      flatProperties: options.flatProperties
    })
  } else {
    return {
      message: 'Unknown Content-Type "' + contentType + '" in response'
    }
  }
}