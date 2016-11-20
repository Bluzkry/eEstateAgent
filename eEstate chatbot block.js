function process(request) {
    const base64Codec = require('codec/base64');
    const query = require('codec/query_string');
    const console = require('console');
    const xhr = require('xhr');
    const pubnub = require('pubnub');

    /*
      TODO: fill values
    */
    let watsonUsername = 'a321cc37-c047-44ea-8a9e-88559b9e53b7';
    let watsonPassword = 'WQqvMfgoz5Ja';
    let workspaceId = 'f7f30228-088f-42b2-9b48-614408a8c4e8';
    let senderName = 'PubNub Bot';
    /*
      TODO: end fill values
    */

    let version = '2016-07-11';

    // bot api url
    let apiUrl = 'https://gateway.watsonplatform.net/conversation/api/v1/workspaces/'
        + workspaceId + '/message';

    let base64Encoded = base64Codec.btoa(watsonUsername + ':' + watsonPassword);

    // bot auth
    let apiAuth = 'Basic ' + base64Encoded;

    let payload = JSON.stringify({
        input: {
            text: request.message.text
        }
    });

    let queryParams = {
        version
    };

    let httpOptions = {
        as: 'json',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: apiAuth
        },
        body: payload,
        method: 'post'
    };

    let url = apiUrl + '?' + query.stringify(queryParams);

    return xhr.fetch(url, httpOptions)
        .then(response => {
            return response.json()
              .then(parsedResponse => {
                  request.message.sender = senderName;

                  if (parsedResponse.output.text.length > 0) {
                      request.message.text = parsedResponse.output.text[0];
                      request.message.snippet = parsedResponse.output.snippet;
                      pubnub.publish({
                          channel: request.message.channel,
                          message: request.message
                      });
                  } else {
                      request.message.text =
                          "Sorry I didn't understand that. " +
                          'Please check what I can do.';
                      pubnub.publish({
                          channel: request.message.channel,
                          message: parsedResponse.output.text
                      });
                  }

                  return request;

              })
              .catch(err => {
                  console.error('error during parsing', err);
              });
        })
        .catch(err => {
            console.error('error during XHR', err);
        });
}
// export default (request) => {
//     const xhr = require("xhr");
//     const query = require('codec/query_string');
//     const query_params = {
//         "user-id": "geremy@pubnub.com",
//         "api-key": "HwX6r15P58A9VJCD47vG4cSoCM0OBraiuf6B9jyi2LYUCGi7",
//         "address": request.message.address,
//         "country-code": request.message.country
//     };

//     const url = "https://neutrinoapi.com/geocode-address" + "?" + query.stringify(query_params);

//     return xhr.fetch(url).then((x) => {
//         const body = JSON.parse(x.body);
//         const result = body.locations[0];
//         request.message.country = result.country;
//         request.message.zip = result["postal-code"];
//         request.message.address = result.address;
//         request.message.city = result.city;
//         request.message.lat = result.latitude;
//         request.message.lon = result.longitude;
//         return request.ok();
//     });
// };
