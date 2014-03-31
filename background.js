/* StoPlay Background JS */

var STOP_ICON = '/img/stop128.png',
	PLAY_ICON = '/img/icon128.png';

localStorage.setItem('status', 'silent');

chrome.browserAction.onClicked.addListener(function(e) {
	var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
		lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId')),
		status = localStorage.getItem('status');
	
	switch(status) {
		case "playing":
			if(lastPlayingTabId) {
				chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'});
			}
			break;

		case "paused":
			if(lastPlayingTabId) {
				chrome.tabs.sendMessage(lastPlayingTabId, {action: 'play'});
			}
			break;
	}
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
		lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId'));

	if(request.action && sender.tab) {
		switch(request.action) {
			case 'started':
				if(lastPlayingTabId && sender.tab.id != lastPlayingTabId) {
					chrome.tabs.sendMessage(lastPlayingTabId, {action: 'pause'});
				}
				localStorage.setItem('lastPlayingTabId', sender.tab.id);
				localStorage.setItem('status', 'playing');
				chrome.browserAction.setIcon({path: STOP_ICON});

				if (request.meta) {
					localStorage.setItem('lastMetaArtist', request.meta.artist);
					localStorage.setItem('lastMetaTitle', request.meta.title);
					var newTitle = "▶ " + request.meta.artist + " - " + request.meta.title + " (StoPlay)";
					chrome.browserAction.setTitle({title: newTitle});
				}
				break;
				
			case 'paused':
				localStorage.setItem('lastPausedTabId', sender.tab.id);
				localStorage.setItem('status', 'paused');
				chrome.browserAction.setIcon({path: PLAY_ICON});
				chrome.browserAction.setTitle({title: "StoPlay" });
				break;
		}
	}
});

chrome.tabs.onRemoved.addListener(function(tabId){
	var lastPlayingTabId = parseInt(localStorage.getItem('lastPlayingTabId')),
		lastPausedTabId = parseInt(localStorage.getItem('lastPausedTabId'));

	if(tabId == lastPlayingTabId) {
		localStorage.setItem('lastPlayingTabId', null);
		if(lastPausedTabId != tabId) {
			chrome.tabs.sendMessage(lastPausedTabId, {action: 'play'});
		}
	}
});