const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-1'});
const github = require("../../src/github/github")
const storage = require("../../src/storage/storage")

const CBG = "Darkcraft Configurable Barter Gold"
const DC = "Darkcraft Core"

// github.getPackageInformation("DarkholmeTenk", "dc_morrowind_mods", "core/")
//     .then(console.log)

// github.getFiles("DarkholmeTenk", "dc_morrowind_mods", "", "master")
//     .then(r=>console.log(JSON.stringify(r)))

// github.getPackageInformation("DarkholmeTenk", "dc_morrowind_mods", "more_barter/")
//     .then(d=>storage.save(d))

// storage.getLatestInfos([CBG, DC, "XXX"])
//     .then(j=>j.forEach(x=>console.log(x)))

// storage.getInfo(CBG, "0.16")
//     .then(j=>console.log(JSON.stringify(j)))

storage.getAll()
    .then(r=>r.forEach(j=>console.log(JSON.stringify(j))))