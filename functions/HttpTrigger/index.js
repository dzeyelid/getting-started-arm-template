module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let status = 200;
    let body = {};
    if (req.query.name || (req.body && req.body.name)) {
        body.name = req.query.name || req.body.name;
    }
    else {
        status = 400;
        body.message = "Please pass a name on the query string or in the request body";
    }

    context.res = {
        status: status,
        body: body,
        headers: {
            'content-type': 'application/json',
        },
    };
};