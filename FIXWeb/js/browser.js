var currentSpecIndex = 0;

var selectedSearchRow = -1;
var numResults = 0;

var browser=navigator.appName;
var tableRowDisplay = "table-row";
if (browser.indexOf("Internet Explorer") >= 0) {
    tableRowDisplay = "block";
}

function loadField(fileName, relative) {
    showFieldPanel()
    if (relative) {
        parent.bottomFrame.location.href = fileName;
    } else {
        parent.bottomFrame.location.href = "specifications/" + currentSpecification + "/fields/" + fileName;
    }
}

function showFieldPanel() {
    var frameset = window.top.document.getElementById('frameset');
    var currentCols = frameset.cols
    var idx = currentCols.lastIndexOf(',')
    var prefix = currentCols.substring(0, idx+1)
    var currentWidth = currentCols.substring(idx+1)
    if (currentWidth == 0) {
        var fieldPanelWidth = getCookie('fieldPanelWidth', '250');
        var newCols = prefix + fieldPanelWidth
        frameset.cols = newCols
    }
}

function hideFieldPanel() {
    var frameset = window.top.document.getElementById('frameset');
    var currentCols = frameset.cols
    var idx = currentCols.lastIndexOf(',')
    var prefix = currentCols.substring(0, idx+1)
    var newCols = prefix + '0'
    var currentWidth = currentCols.substring(idx+1)
    if (currentWidth > 0) {
        setCookie('fieldPanelWidth', currentWidth);
    }
    frameset.cols = newCols
}

function setCookie(c_name, value)
{
    document.cookie = c_name + "=" + escape(value);
}

function getCookie(c_name, def) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";",c_start);
            if (c_end == -1)
                c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return def;
}

function loadComponent(fileName, relative) {
    if (relative) {
        parent.topFrame.location.href = fileName;
    } else {
        parent.topFrame.location.href = "specifications/" + currentSpecification + "/components/" + fileName;
    }
}

function loadMessage(fileName, relative) {
    if (relative) {
        parent.topFrame.location.href = fileName;
    } else {
        parent.topFrame.location.href = "specifications/" + currentSpecification + "/messages/" + fileName;
    }
}

function loadByName(fileName, relative) {
    if (relative) {
        parent.topFrame.location.href = fileName;
    } else {
        parent.topFrame.location.href = "specifications/" + currentSpecification + "/" + fileName;
    }
}

function clearSearch() {
    var searchBar = document.getElementById('searchBar');
    searchBar.value = "";
    var searchResultsBox = document.getElementById('searchResults');
    searchResultsBox.innerHTML = "";
    searchResultsBox.style.visibility = "hidden";
    document.getElementById('searchSpinner').style.display = "none";
    selectedSearchRow = -1;
    numResults = 0;
}

function searchTagTrie(trieNode, results) {
    if (trieNode.name) {
        if (trieNode.msgtype) {
            results.push("<div class='searchRow messageRow' title=\"" + (results.length) + "\" name=\"" + (results.length) + "\" onclick='clearSearch(); loadMessage(\"" + trieNode.name.toLowerCase() + ".html\", 0);'>" + trieNode.name + '(' + trieNode.msgtype + ')' + "</div>");
        } else if (trieNode.tag) {
            results.push("<div class='searchRow fieldRow' title=\"" + (results.length) + "\" name=\"" + (results.length) + "\" onclick='clearSearch(); loadField(\"" + trieNode.name.toLowerCase() + ".html\", 0);'>" + trieNode.name + '(' + trieNode.tag + ')' + "</div>");
        } else {
            results.push("<div class='searchRow componentRow' title=\"" + (results.length) + "\" name=\"" + (results.length) + "\" onclick='clearSearch(); loadComponent(\"" + trieNode.name.toLowerCase() + ".html\", 0);'>" + trieNode.name + "</div>");
        }
    }
    for (key in trieNode) {
        if (key.length == 1) {
            searchTagTrie(trieNode[key], results);
        }
    }
}

function searchChanged() {
    document.getElementById('searchSpinner').style.display = "inline";
    var searchBar = document.getElementById('searchBar');
    var searchText = searchBar.value.toLowerCase();
    var searchResultsBox = document.getElementById('searchResults');
    
    if (searchText === null || searchText === "") {
        clearSearch();
        return;
    }
    
    numResults = 0;
    
    var resultString = "";
    var i = 0;
    var curNode = trie;
    for (i=0; i<searchText.length; i++) {
        var cur = searchText.substr(i, 1);
        if (!curNode[cur]) {
            curNode = null;
            break;
        }
        curNode = curNode[cur];
    }
    if (curNode != null) {
        var results = new Array();
        searchTagTrie(curNode, results);
        for (result in results) {
            resultString = resultString + results[result];
        }
        numResults = results.length;
    }
    
    if (numResults === 0) {
        searchResultsBox.innerHTML = "";
        document.getElementById('searchSpinner').style.display = "none";
        return;
    }
    
    searchResultsBox.innerHTML = resultString;
    document.getElementById('searchSpinner').style.display = "none";
    searchResultsBox.style.visibility = "visible";
    positionBelow(searchResultsBox, searchBar);
}

function positionBelow(source, target) {
    source.style.left = target.offsetLeft;
    source.style.top = target.offsetTop + target.offsetHeight
    source.style.width = source.parentNode.offsetWidth - source.offsetLeft - 5;
}

function expand(nodeName, row) {
    var table = row.parentNode;
    var rows = table.getElementsByTagName("tr");
    for (var i = row.rowIndex+1; i < rows.length; i++) {
        var curRow = rows[i];
        var before = curRow.style.display;
        if (curRow.className.indexOf(nodeName) < 0) {
            break;
        }
        if (curRow.style.display == "none" || curRow.style.display == "") {
            curRow.style.display = tableRowDisplay;
        } else {
            curRow.style.display = "none";
        }
    }
}

function getElementsByClass(tagName, className) {
    var pageTags = document.getElementsByTagName(tagName);
    
    var validItems = [];
    
    for (var i = 0; i < pageTags.length; i++) {
        if (pageTags[i].className.indexOf(className) != -1) {
            validItems[validItems.length] = pageTags[i];
        }
    }
    
    return validItems;
}

//function buildSpecificationDropdown() {
//    var dropdown = document.getElementById('specDropdown');
//    
//    for (var i = 0; i < validSpecifications.length; i++) {
//        var specOption = document.createElement("OPTION");
//        specOption.text = validSpecifications[i];
//        specOption.value = validSpecifications[i];
//        dropdown.options.add(specOption);
//    }
//}

function registerSearch() {
    document.getElementById('searchBar').onkeyup = function(ev) {
        var keyCode = 0;
        
        try {
            keyCode = window.event.keyCode;
        } catch (e) {
            try {
                keyCode = ev.keyCode;
            } catch (ex) {
                try {
                    keyCode = ev.which;
                } catch (ex2) {
                    searchChanged();
                    return;
                }
            }
        }
        
        if (keyCode == 13) {
            // Enter
            var searchRows = getElementsByClass("div", "searchRow");
            var searchRow = searchRows[selectedSearchRow];
            searchRow.onclick();
            return;
        }
        
        if (keyCode == 27) {
            // Escape
            clearSearch();
            return;
        }
        
        if ((keyCode == 38 || keyCode == 40) && (selectedSearchRow != -1)) {
            searchRows = getElementsByClass("div", "searchRow");
            searchRow = searchRows[selectedSearchRow];
            searchRow.style.backgroundColor = "#FFF";
        }
        
        if (keyCode == 38 || keyCode == 40) {
        
            if (keyCode == 38) {
                if (selectedSearchRow >= 0) {
                    selectedSearchRow--;
                }
            } else if (keyCode == 40) {
                if (selectedSearchRow < (numResults - 1)) {
                    selectedSearchRow++;
                }
            }
        
            searchRows = getElementsByClass("div", "searchRow");
            
            searchRow = searchRows[selectedSearchRow];
            
            searchRow.style.backgroundColor = "#DDD";
            
            return;
        }
    
        searchChanged();
    };
}

function loadSpecification() {
    var specDropdown = document.getElementById('specDropdown');
    currentSpecification = specDropdown.options[specDropdown.selectedIndex].text.replace(/\./g, "");
    currentSpecIndex = specDropdown.selectedIndex;
    parent.topFrame.location.href = "blank.html";
    parent.bottomFrame.location.href = "blank.html"
}
