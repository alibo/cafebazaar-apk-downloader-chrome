chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    if (tab.url && tab.url.startsWith('https://cafebazaar.ir/app/') && changeInfo.status == 'complete') {
        chrome.tabs.executeScript(null, {
            file: 'scripts/injectScript.js',
            runAt: 'document_end'
        })
    }
})