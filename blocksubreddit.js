// ==UserScript==
// @name         Reddit block subreddits
// @version      0.0.1
// @description  Block subreddits you don't like
// @license      MIT
// @namespace    https://github.com/tadghh/reddit-block-subreddits
// @author       https://github.com/tadghh/
// @source 		 https://github.com/tadghh/reddit-block-subreddits
// @match        *://new.reddit.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var firstDiv = document.body;
    var observer;

    // Function to handle the button click
    function handleButtonClick() {
        var neighboringDiv = this.parentElement.querySelector('div div a[data-click-id="subreddit"]:not(:has(img))');

        var aElement = neighboringDiv;

        if (aElement) {
            var subredditName = aElement.innerText;
            removeSubreddit(subredditName);

            var storedArrayString = localStorage.getItem('storedSubreddits');
            var storedArray = storedArrayString ? JSON.parse(storedArrayString) : [];

            storedArray.push(subredditName);

            localStorage.setItem('storedSubreddits', JSON.stringify(storedArray));

            console.log(subredditName + ' added to the array and localStorage.');
            console.log(storedArray);
        }
    }

    // Function to add the new button
    function addNewButton(button) {
        var newButton = button.cloneNode(true);
        newButton.id = 'block-button';
        newButton.textContent = 'Block';

        button.parentElement.appendChild(newButton);

        newButton.addEventListener('click', handleButtonClick);
    }

    // Function to find the ancestor with a specific data-testid
    function findParentWithTestId(element, testId) {
        while (element.parentElement) {
            element = element.parentElement;
            if (element.getAttribute('data-testid') === testId) {
                return element;
            }
        }
        return null;
    }

    // Function to remove a subreddit from the page
    function removeSubreddit(subreddit) {
        var links = document.querySelectorAll('a[href*="' + subreddit + '"]');
        links.forEach(function (link) {
            if (link.textContent.trim() === subreddit) {
                var container = findParentWithTestId(link, 'post-container');
                if (container) {
                    container.remove();
                }
            }
        });
    }

    // Function to check if a post is in the blocked list
    function isPostBlocked(post) {
        console.log("run");
        console.log(post);
        var links = post.querySelectorAll('a[data-click-id="subreddit"]:not(:has(img))');
        console.log(links);
        for (var i = 0; i < links.length; i++) {
            var subredditName = links[i].innerText;
            if (!isSubredditBlocked(subredditName)) {
                return false;
            }
        }
        return true;
    }

    // Function to check if a subreddit is blocked
    function isSubredditBlocked(subreddit) {
        var storedArrayString = localStorage.getItem('storedSubreddits');
        var storedArray = storedArrayString ? JSON.parse(storedArrayString) : [];
        return storedArray.includes(subreddit);
    }
	
    function handleMutationChanges(mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (addedNode) {

                if (addedNode.nodeType === Node.ELEMENT_NODE) {

                    if (addedNode.querySelector('[data-testid="post-container"]')) {
                        console.log(addedNode);
                        let button = addedNode.querySelector('button[id^="subscribe-button-"]');

                        addNewButton(button);

                    }
                }
            });
        });
    }

    observer = new MutationObserver(handleMutationChanges);
    observer.observe(firstDiv, {
        childList: true,
        subtree: true
    });
	
    // Wait for the window to be fully loaded
    window.onload = function () {
        // Select buttons after the document is ready
        var buttons = document.querySelectorAll('button[id^="subscribe-button-"]');
        firstDiv = document.querySelector('div[data-scroller-first]').parentNode;

        // Add the new button for each found button
        buttons.forEach(function (button) {
            addNewButton(button);
        });
    };
})();
