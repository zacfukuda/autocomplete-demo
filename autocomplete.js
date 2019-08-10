/**
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Range
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Selection
 * @link https://www.quirksmode.org/dom/range_intro.html
 * @link https://stackoverflow.com/questions/3972014/get-caret-position-in-contenteditable-div
 */

const data = [
	{_id: 1, name: 'React.js'},
	{_id: 2, name: 'MongoDB'},
	{_id: 3, name: 'Node.js'},
	{_id: 4, name: 'Wordpress'},
	{_id: 5, name: 'Facebook'},
]

const suggestionWindowSize = {
	width: 240,
	height: 200
}

const textarea = document.getElementById('textarea')
const textareaInput = textarea.querySelector('span.input')
const suggestion = document.getElementById('suggestion')

// Set width
suggestion.style.width = suggestionWindowSize.width + 'px'
// suggestion.style.height = suggestionWindowSize.height + 'px'

const textareaStyle = getComputedStyle(textarea)

const positionadjustment = {
	left: -suggestionWindowSize.width/2,
	top: parseInt(textareaStyle.lineHeight)
}

// Backspace/delete handler
textarea.onkeydown = function(e) {
	var key = e.keyCode || e.charCode

	if ( key == 8 || key == 46) {
		var sel = window.getSelection()
		console.log(sel)
		e.preventDefault()
	}
}

textarea.oninput = function(e) {
	var sel, focusNode, range, value, suggestion, suggests

	sel = window.getSelection()
	focusNode = sel.focusNode
	value = focusNode.data

	// Input to text to span.input
	if (focusNode.parentElement !== textareaInput) {
		textareaInput.innerHTML = value
		range = new Range()
		range.selectNodeContents(textareaInput.lastChild) // Select text node, not DOM element
		range.collapse(false)
		sel.removeAllRanges()
		sel.addRange(range)
		
		// Delete original user input
		focusNode.remove()
	}

	if ( !value ) {
		hideSuggestion()
		return
	}
	
	suggests = getSuggestion(value)
	updateSuggestion(suggests)
}

function getCaretPosition() {

	var x = y = 0;
	var sel = window.getSelection()

	if (sel.rangeCount) {
		var range = sel.getRangeAt(0).cloneRange()
		if (range.getClientRects()) {
			range.collapse(true)
			var rect = range.getClientRects()[0]
			if (rect) {
				x = rect.left + positionadjustment.left
				x = (x < 10) ? 10 : x
				y = rect.top + positionadjustment.top
			}
		}
	}
	return {left: x, top: y}
}

function hideSuggestion() {
	suggestion.style.display = 'none'
}

function getSuggestion(value) {
	
	const regexString = value.replace(/^\s/, '') // replace the beginning of space
	const regex = new RegExp('^' + regexString, 'i')
	const suggests = data.filter(ob => regex.test(ob.name))
	
	return suggests
}

function updateSuggestion(suggests) {
	
	if (suggests.length < 1) {
		hideSuggestion()
		return
	}

	const suggestLinks = suggests.map(s => {
		const textNode = document.createTextNode(s.name)
		const a = document.createElement('A')
		a.href = s._id
		a.title = s.name
		a.onclick = insertToTextarea
		a.appendChild(textNode)
		return a
	})

	// Remove all suggestion nodes
	while(suggestion.firstChild) {
		suggestion.firstChild.remove()
	}

	suggestLinks.forEach(link => {
		suggestion.appendChild(link)
	})
	
	if (suggestion.style.display === 'block') { return }

	var postion = getCaretPosition()
	suggestion.style.left = postion.left + 'px'
	suggestion.style.top = postion.top + 'px'
	suggestion.style.display = 'block'
}

function insertToTextarea(e) {
	e.preventDefault()

	var link = e.target
	var input = document.createElement('INPUT')
	var span = document.createElement('SPAN')
	var textNode = document.createTextNode(link.title)
	
	input.type = 'hidden'
	input.name = 'tags[]'
	input.value = link.href
	
	span.className = 'tag'
	span.appendChild(input)
	span.appendChild(textNode)

	// Clean inside textarea, remove unnecessary text nodes like \n
	let lastChild = textareaInput.lastChild 
	while ( lastChild.nodeType === Node.TEXT_NODE ) {
		lastChild.remove()
		lastChild = textareaInput.lastChild 
		if ( lastChild === null ) break;
	}

	// Insert space, otherwise the range will be inside span.tag
	textareaInput.appendChild(document.createTextNode(' '))

	// Append a new tag node
	textarea.insertBefore(span, textareaInput)
	
	// Caret at the end of editor
	var range = new Range()
	var sel = window.getSelection()
	range.selectNodeContents(textareaInput)
	range.collapse(false)
	// range.setStartAfter(span)
	// range.setEndAfter(span)
	sel.removeAllRanges()
	sel.addRange(range)

	// Hide suggetions
	hideSuggestion()
}
