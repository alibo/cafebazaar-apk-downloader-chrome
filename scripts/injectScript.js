
function waitForElement(selector) {
    return new Promise(function (resolve, reject) {
        let element = document.querySelector(selector)

        if (element) {
            resolve(element)
            return;
        }

        const interval = setInterval(() => {
            let element = document.querySelector(selector);

            if (element) {
                clearInterval(interval)
                resolve(element)
                return;
            }
        }, 100)
    });
}

waitForElement('a[itemprop="offers"').then(btn => {
    let url = btn.getAttribute('href')
    let priceMeta = btn.querySelector('meta[itemprop="price"]')

    let price = priceMeta.getAttribute('content')
    let pkg = new URL(url).searchParams.get('id')

    if (price != 0) {
        return
    }

    fetch('https://api.cafebazaar.ir/rest-v1/process/AppDownloadInfoRequest', {
        mode: 'cors',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            "Content-type": 'application/json'
        },
        body: JSON.stringify({
            properties: {
                androidClientInfo: {
                    sdkVersion: 22,
                    cpu: 'x86,armeabi-v7a,armeabi'
                }
            },
            singleRequest: {
                appDownloadInfoRequest: {
                    downloadStatus: 1,
                    packageName: pkg,
                }
            }
        })
    }).then(async response => {
        let res = await response.json()

        if (!res.properties || res.properties.statusCode != 200) {
            console.log('Invalid response:', res)
            return
        }

        let token = res.singleReply.appDownloadInfoReply.token
        let cdnPrefix = res.singleReply.appDownloadInfoReply.cdnPrefix[0]
        let packageSize = res.singleReply.appDownloadInfoReply.packageSize / 1024 / 1024
        let versionCode = res.singleReply.appDownloadInfoReply.versionCode || 0
åå
        let downloadLink = `${cdnPrefix}apks/${token}.apk`

        console.log('APK download link:', downloadLink)

        let downloadBtn = document.createElement("a")
        downloadBtn.setAttribute('class', 'btn btn-primary')
        downloadBtn.setAttribute('href', downloadLink)
        downloadBtn.setAttribute('title', `${token}_${pkg}_${versionCode}.apk`)
        downloadBtn.innerHTML = `دانلود (${packageSize.toFixed(2)} MB)`

        btn.parentNode.insertBefore(downloadBtn, btn.parentNode.childNodes[0])
        btn.parentNode.removeChild(btn)

    }).catch(err => console.log('Request failed', err))
})