const fetch = require("./githubFetch")

var exports = module.exports = {}

exports.getLatestCommit = function(owner, repo) {
    return fetch(`https://api.github.com/repos/${owner}/${repo}/branches/master`)
        .then(r=>r.json())
        .then(r=>r.commit)
}

exports.getPackageInformation = function(owner, repo, folder) {
    return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder}mwpackage.json`)
        .then(r=>r.json())
        .then(r=>{
            if(r.message == "Not Found")
                throw "File not found"
            else if(r.download_url)
                return fetch(r.download_url)
            else
                throw "No download url"
        })
        .then(r=>r.json())
        .then(r=>{
            if(!r.name) throw "No name found"
            if(!r.version) throw "No version found"
            if(!r.deps) throw "No deps field found"
            if(!r.installTo) throw "No installTo field found"
            if(typeof(r.name) != "string") throw "Name must be string"
            if(typeof(r.version) != "string") throw "Version must be string"
            if(r.deps && !Array.isArray(r.deps)) throw "Deps must be an array"
            return exports.getLatestCommit(owner, repo)
                .then(c=>{
                    return {
                        name: r.name,
                        version: r.version,
                        desc: r.desc || "",
                        deps: r.deps,
                        owner: owner,
                        repo: repo,
                        folder: folder,
                        commit: c.sha
                    }
                })
        })
}

exports.getFiles = function(owner, repo, folder, ref) {
    return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folder}?ref=${ref}`)
        .then(r=>r.json())
        .then(r=>{
            if(!Array.isArray(r) || r.message == "Not Found")
                throw "Not found"
            return Promise.all(r.map(file=>{
                if(file.type == "file")
                    return Promise.resolve([{name:file.name, path:file.path.substring(folder.length), url:file.download_url}])
                else if(file.type == "dir")
                {
                    return exports.getFiles(owner, repo, folder + file.name+"/", ref)
                        .then(f=>{
                            f.forEach(g=>g.path=file.name + "/" + g.path)
                            return f
                        })
                }
            }))
        })
        .then(r=>{
            let arr = []
            r.forEach(x=>x.forEach(y=>arr.push(y)))
            return arr
        })
}