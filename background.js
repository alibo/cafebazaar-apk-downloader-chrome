chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    if (tab.url && tab.url.startsWith('https://cafebazaar.ir/app/') && changeInfo.status == 'complete') {
        console.log(`injecting script: `, tab.url)
        chrome.scripting.executeScript({
            files: ['injectScript.js'],
            target: {tabId: tab.id}
        })
    }
})
