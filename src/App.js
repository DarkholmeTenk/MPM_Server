const github = require("./github/github")
const storage = require("./storage/storage")

const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder()
module.exports = api

api.get("/list", function(request) {
    return storage.getAll()
})

api.get("/getInfo", function(request) {
    let name = request.queryString.name
    let version = request.queryString.version
    if(!name || !version)
        return {err:"A name and a version query parameter must be provided"}
    return storage.getInfo(name, version)
        .then(r=>{
            if(r)
                return r
            else
                return {err:"No record found"}
        },r=>({err:r}))
})

api.get("/getLatest", function(request) {
    let name = request.queryString.name
    if(!name)
        return {err:"A name must be provided"}
    return storage.getLatestInfo(name)
        .catch(r=>({err:r}))
})

api.post("/getLatests", function(request) {
    let data = request.body
    return storage.getLatestInfos(data)
        .err(e=>({err:e}))
})

api.post("/save", function(request) {
    let data = request.body
    let owner = data.owner
    let repo = data.repo
    let folder = data.folder
    if(!owner || !repo || !folder)
        return ({err:"Must provide an owner, repo and folder"})
    github.getPackageInformation(owner, repo, folder)
        .then(data=>storage.save(data))
})

api.get("/getFiles", function(request) {
    let name = request.queryString.name
    let version = request.queryString.version
    if(!name || !version)
        return ({err:"A name and a version query parameter must be provided"})
    return storage.getInfo(name, version)
        .then(d=>github.getFiles(d.owner, d.repo, d.folder, d.commit))
        .catch(e=>({err:e}))
})