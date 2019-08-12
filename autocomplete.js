
(function autocomplete(id, data, option) {

	// DOM
	const textarea = document.getElementById(id)
	const inputArea = textarea.querySelector('span.input')
	const suggestionBox = document.getElementById('suggestion')

	// Options
	const suggestionBoxSize = {
		width: 240,
		height: 200
	}
	suggestionBox.style.width = suggestionBoxSize.width + 'px'
	suggestionBox.style.maxHeight = suggestionBoxSize.height + 'px'

	const textareaStyle = getComputedStyle(textarea)

	const caretPositionAdjustment = {
		left: -suggestionBoxSize.width/2,
		top: parseInt(textareaStyle.lineHeight)
	}

	/**
	 * 'keydown' handler
	 * @param e event Object
	 * @return null
	 */
	function keydownHandler(e) {
		var key = e.keyCode || e.charCode

		// ENTER
		if ( key === 13 ) { return keyEnter(e) }
		// Proceed only "delete" or "backspace" key is down
		if ( key == 8 || key == 46) { return keyDelete(e) }

		return
	}

	/**
	 * ENTER
	 */
	function keyEnter(e) {
		e.preventDefault()
		console.log("Enter!")
	}

	/**
	 * DELETE or BACKSPACE
	 */
	function keyDelete(e) {
		var string = inputArea.innerHTML

		// String has more than 2 letters
		if (string.length > 2) { return }

		var sel = window.getSelection()
		var focusNode = sel.focusNode

		var tags = textarea.querySelectorAll('span.tag')
		var tagLength = tags.length

		if ( string.length === 1  || focusNode === textarea || focusNode.parentElement === textarea) {
			e.preventDefault()

			// One or no tag
			if ( tagLength < 2 ) {				
				inputArea.innerHTML = ''
				textarea.focus()

				hideSuggestion()
			}

			// Delete the last of tags
			if ( tagLength ) { tags[tagLength-1].remove() }
		}

		return
	}

	/**
	 * 
	 */
	function inputHandler(e) {
		var sel = window.getSelection()
		var focusNode = sel.focusNode
		var value = focusNode.data

		// Input to the span.input
		if ( focusNode.parentElement !== inputArea ) {
			inputArea.innerHTML = value
			focusInput()

			// Remove original user input
			focusNode.remove()
		}

		if ( value == ' ') { return hideSuggestion() }

		return updateSuggestion( getSuggestion(value) )
	}

	/**
	 *
	 */
	function getSuggestion(value) {
		var regexString = value.replace(/^\s/, '') // replace the beginning of space
		var regex = new RegExp('^' + regexString, 'i')
		
		return data.filter(ob => regex.test(ob.name))
	}

	function updateSuggestion(suggestions) {
		// No match
		if (suggestions.length < 1) { return hideSuggestion() }

		var suggestLinks = suggestions.map(s => {
			var textNode = document.createTextNode(s.name)
			var a = document.createElement('A')
			a.href = s._id
			a.title = s.name
			a.onclick = addTag
			a.appendChild(textNode)
			return a
		})

		// Remove all suggestion nodes
		while(suggestionBox.firstChild) {
			suggestionBox.firstChild.remove()
		}

		// Append suggetions to the box
		suggestLinks.forEach(link => {
			suggestion.appendChild(link)
		})

		// If suggestion is already displayed
		if (suggestion.style.display === 'block') { return }

		var boxPosition = getCaretPosition()
		suggestion.style.left = boxPosition.x + 'px'
		suggestion.style.top = boxPosition.y + 'px'
		suggestion.style.display = 'block'

	}
	
	/**
	 *
	 */
	function hideSuggestion() {
		suggestionBox.style.display = 'none'
		return
	}

	/**
	 *
	 */
	function getCaretPosition() {
		var x = y = 0
		var sel = window.getSelection()
		var range = sel.getRangeAt(0).cloneRange()

		range.collapse(true)

		var rect = range.getClientRects()[0]
		if (rect) {
			x = rect.left + caretPositionAdjustment.left
			x = (x < 10) ? 10 : x // Don’t get too clesed to the window edge
			y = rect.top + caretPositionAdjustment.top
		}

		return {x: x, y: y}
	}

	/**
	 *
	 */
	function focusInput() {
		var range = new Range()
		var sel = window.getSelection()
		range.selectNodeContents(inputArea.lastChild)
		range.collapse(false)
		sel.removeAllRanges()
		sel.addRange(range)
		return
	}

	/**
	 *
	 */
	function addTag(e) {
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

		// empty the inside of span.input
		let lastChild = inputArea.lastChild
		while ( lastChild.nodeType === Node.TEXT_NODE ) {
			lastChild.remove()
			lastChild = inputArea.lastChild 
			if ( lastChild === null ) break;
		}

		// Insert space, otherwise the range will be inside span.tag
		inputArea.appendChild(document.createTextNode(' '))

		// Append a new tag node
		textarea.insertBefore(span, inputArea)
		
		// Caret at the end of editor
		focusInput()

		// Hide suggetions
		hideSuggestion()

		return
	}

	textarea.onkeydown = keydownHandler
	textarea.oninput = inputHandler

})('textarea', tagData)
