
import * as path from 'path';
import { VITE_DIR, getOsPlatform, getGviteName, OS_PLATFORM, PLATFORM_ERROR } from './constant';
import * as fs from 'fs';
import  uri from './uri';
import * as request from 'request';
import * as decompress from 'decompress';
import SolidityppDebugSession from './debugSession';
import {
    OutputEvent
} from 'vscode-debugadapter';

// const decompressUnzip = require( 'decompress-unzip');
const decompressTargz = require('decompress-targz');



function getOrigGviteName ():string {
    let osPlatform = getOsPlatform();
    switch (osPlatform) {
        case OS_PLATFORM.WIN32:
            throw PLATFORM_ERROR
        case OS_PLATFORM.WIN64:
            return "gvite-windows-amd64.exe"
        default:
            return "gvite"
    }
}

function getGvitePath () :string {
    return path.resolve(VITE_DIR, getGviteName())
}


function getGviteCompressedPath () :string{
    let osPlatform = getOsPlatform();
    let compressedFilePath = ''
    switch (osPlatform) {
        case OS_PLATFORM.DARWIN: {
            compressedFilePath = path.resolve(VITE_DIR, "gvite-darwin.zip");
            break;
        }
        case OS_PLATFORM.LINUX: {
            compressedFilePath = path.resolve(VITE_DIR, "gvite-linux.zip");
            break;

        }
        case OS_PLATFORM.WIN64: {
            compressedFilePath = path.resolve(VITE_DIR, "gvite-win64.zip");                 
            break;

        }
        case OS_PLATFORM.WIN32: {
            throw PLATFORM_ERROR

        }
    }
    return compressedFilePath
}

function checkGviteIsExisted() :boolean{
    return fs.existsSync(getGvitePath());
}

// function checkCompressedGviteIsExisted() :boolean{
//     return fs.existsSync(getGviteCompressedPath());
// }

async function downloadGvite (ds: SolidityppDebugSession) {
    let osPlatform = getOsPlatform();
    let downloadUri = ""

    switch (osPlatform) {
        case OS_PLATFORM.DARWIN: {
            downloadUri = uri.gviteDownload.darwin
            break;
        }
        case OS_PLATFORM.LINUX: {
            // compressedFilePath = path.resolve(VITE_DIR, "gvite-linux.zip");
            downloadUri = uri.gviteDownload.linux
            break;

        }
        case OS_PLATFORM.WIN64: {
            downloadUri = uri.gviteDownload.win64
            // compressedFilePath = path.resolve(VITE_DIR, "gvite-win64.zip");                      
            break;

        }
        case OS_PLATFORM.WIN32: {
            throw PLATFORM_ERROR
            // compressedFilePath = path.resolve(VITE_DIR, "gvite-win32.zip");
        }
    }

    // download
    await new Promise(function (resolve, reject) {
         ds.sendEvent(new OutputEvent('Downloading vite...\n', 'stdout'))

        let requestStrem = request(downloadUri)
        let fsStream = fs.createWriteStream(getGviteCompressedPath())

        let downloadedSize = 0
        let totalSize = 0 
        requestStrem.on('error', function (err) {
            reject(err)
        }).on('response', function (response) {
            if (response.statusCode != 200) {
                return reject(response)
            }

            totalSize = Number(response.headers["content-length"])
        }).on('data', function (d) {
            downloadedSize += d.length
            ds.sendEvent(new OutputEvent(`Downloading vite: ${((downloadedSize / totalSize) * 100).toFixed(2)}%\n`, 'stdout'))
        }).pipe(fsStream)

        fsStream.on("finish", function () {
             ds.sendEvent(new OutputEvent('Vite downloaded complete\n', 'stdout'))
             resolve()  
        })
    })
}

async function uncompressGvite () {
    await decompress(getGviteCompressedPath(), VITE_DIR, {
        plugins: [
            decompressTargz()
        ]
    }).then(files => {
        let gviteName = getGviteName()
        let origGviteName = getOrigGviteName()
        let directory = files[0].path
        for (let i = 1; i < files.length; i++) {
            let filePath = files[i].path
            let fileName = filePath.replace(directory, "")
            if (fileName === origGviteName) {
                fs.renameSync(path.join(VITE_DIR, filePath), path.join(VITE_DIR, gviteName))
                break;
            }
        }
        return files;
    });
}

export default async function createGvite (ds: SolidityppDebugSession) {
    if (checkGviteIsExisted()) {
        return
    }

    // if (!checkCompressedGviteIsExisted()) {
    // }
    await downloadGvite(ds);

    await uncompressGvite();
}