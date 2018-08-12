var AWS = require('aws-sdk')
var dynamo = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
})
const TABLE = "MPM"

var exports = module.exports = {}

exports.getInfo = function(name, version) {
    return dynamo.get({
            TableName: TABLE,
            Key: {
                name: name,
                version: version
            }
        }).promise()
        .then(r=>r.Item)
}

exports.getInfos = function(name) {
    return dynamo.query({
            TableName: TABLE,
            KeyConditionExpression:"#name = :keyval",
            ExpressionAttributeNames:{"#name": "name"},
            ExpressionAttributeValues:{":keyval":  name}
        }).promise()
        .then(r=>r.Items)
}

exports.getLatestInfo = function(name) {
    return exports.getInfos(name)
        .then(results=>{
            if(results.length == 0)
                throw "No versions found for " + name
            let highest = null
            results.forEach(result=>{
                if(highest == null || result.version > highest.version)
                    highest = result
            })
            return highest
        })
}

exports.getLatestInfos = function(names) {
    return Promise.all(names.map(name=>exports.getLatestInfo(name)))
}

function verify(data) {
    data.deps = data.deps || []
    return exports.getInfo(data.name, data.version)
        .then(r=>{
            if(r)
                throw `Mod [${data.name}] already has a version [${data.version}]`
            return exports.getLatestInfo(data.name)
        })
        .then(r=>{
            if(r && r.owner != data.owner)
                throw `Mod [${data.name}] is owned by [${r.owner}] and cannot be updated by [${data.owner}]`
            return exports.getLatestInfos(data.deps)
        })
        .then(r=>true)
}

exports.save = function(data) {
    return verify()
        .then(r=>{
            return dynamo.put({
                    TableName: TABLE,
                    Item: data
                }).promise()
        })
}

exports.getAll = function() {
    return dynamo.scan({
        TableName: TABLE
    }).promise()
    .then(r=>r.Items)
}