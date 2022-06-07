(async () => {
  if (window.CHROME_EXT_CAFEBAZAAR_DOWNLOADER_INJECTED) {
    return;
  }

  window.CHROME_EXT_CAFEBAZAAR_DOWNLOADER_INJECTED = true;
  const BUTTON_QUERY = "div.DetailsPageHeader__desktop a.AppInstallBtn";

  await watchForPackage();

  async function watchForPackage(btn) {
    try {
      if (!btn || !document.body.contains(btn)) {
        btn = await waitForElement(BUTTON_QUERY);
        let url = btn.getAttribute("href");
        let pkg = new URL(url).searchParams.get("id");

        if (url && pkg) {
          await find(pkg);
        }
      }
    } catch {}

    setTimeout(() => {
      watchForPackage(btn);
    }, 500);
  }

  async function waitForElement(selector) {
    return new Promise(function (resolve, reject) {
      let element = document.querySelector(selector);

      if (element) {
        resolve(element);
        return;
      }

      const interval = setInterval(() => {
        let element = document.querySelector(selector);

        if (element) {
          clearInterval(interval);
          resolve(element);
          return;
        }
      }, 100);
    });
  }

  async function find(pkg) {
    try {
      let response = await findDownloadLink(pkg);
      let res = await response.json();

      if (!res.singleReply || !res.singleReply.appDownloadInfoReply) {
        console.log("Invalid response:", res);
        return;
      }

      let token = res.singleReply.appDownloadInfoReply.token;
      let cdnPrefix = res.singleReply.appDownloadInfoReply.cdnPrefix[0];
      let packageSize =
        res.singleReply.appDownloadInfoReply.packageSize / 1024 / 1024;
      let versionCode = res.singleReply.appDownloadInfoReply.versionCode || 0;

      let downloadLink = `${cdnPrefix}apks/${token}.apk`;

      console.log("APK download link:", downloadLink);

      await changeButton(downloadLink, packageSize, versionCode, token, pkg);
    } catch (error) {
      console.log("Request failed", error);
    }
  }

  async function findDownloadLink(pkg) {
    return fetch(
      "https://api.cafebazaar.ir/rest-v1/process/AppDownloadInfoRequest",
      {
        mode: "cors",
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            language: 2,
            clientVersionCode: 1100301,
            androidClientInfo: {
              sdkVersion: 22,
              cpu: "x86,armeabi-v7a,armeabi",
            },
            clientVersion: "11.3.1",
            isKidsEnabled: false,
          },
          singleRequest: {
            appDownloadInfoRequest: {
              downloadStatus: 1,
              packageName: pkg,
              referrers: [],
            },
          },
        }),
      }
    );
  }

  async function changeButton(
    downloadLink,
    packageSize,
    versionCode,
    token,
    pkg
  ) {
    let btn = await waitForElement(BUTTON_QUERY);
    let downloadBtn = document.createElement("a");

    downloadBtn.setAttribute("class", "AppInstallBtn newbtn");
    downloadBtn.setAttribute("href", downloadLink);
    downloadBtn.setAttribute("title", `${token}_${pkg}_${versionCode}.apk`);
    downloadBtn.setAttribute("data-color", "primary");
    downloadBtn.setAttribute("data-size", "lg");
    downloadBtn.innerHTML = `⬇️ دانلود (${packageSize.toFixed(2)} MB)`;

    btn.parentNode.insertBefore(downloadBtn, btn.parentNode.childNodes[0]);
    btn.parentNode.removeChild(btn);
  }
})();
