(function(){
	var keywords = [
		'React.js', 'MongoDB', 'Node.js', 'Wordpress', 'Facebook',
		'Twitter', 'Google', 'Vue.js', 'Angular.js', 'PHP', 'Phython',
		'Java', 'JavaScript'
	]
	
	window.tagData = keywords.map((name, index) => {
		var item = {id: index, name: name }
		return item
	})

})()
