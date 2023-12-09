findHighestZ = () =>
    [...document.querySelectorAll("body *")]
        .map((element) => parseFloat(getComputedStyle(element).zIndex))
        .reduce((highest, z) => (z > highest ? z : highest), 1);
//-------------------------------------------------
function cancelEvent(event) {
    //event.preventDefault();
    event.cancelBubble = true;
}
//-------------------------------------------------
function isTruncated(elem) {
    // debugger;
    if (elem.offsetWidth !== elem.scrollWidth) {
        return true;
    }
    return false;
}
/* //-------------------------------------------------
function GetStyleValue(e, styleName) {
    let styleValue = "";
    if (document.defaultView && document.defaultView.getComputedStyle) {
        styleValue = document.defaultView.getComputedStyle(e, "").getPropertyValue(styleName);
    } else if (e.currentStyle) {
        styleName = styleName.replace(/\-(\w)/g, function (strMatch, p1) {
            return p1.toUpperCase();
        });
        styleValue = e.currentStyle[styleName];
    }
    return styleValue;
} */
//-------------------------------------------------
function sortObjectByKeys(o) {
    return Object.keys(o)
        .sort()
        .reduce((r, k) => ((r[k] = o[k]), r), {});
}
//-------------------------------------------------
isOverflowing = (element) => {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
};
//-------------------------------------------------