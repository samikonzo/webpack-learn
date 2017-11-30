var ReactDom = require('react-dom'),
	React = require('react'),
	Notes = require('./components/notes.jsx');


var noNameNoteCount = 0;

[].forEach.call(document.querySelectorAll('.note'), note => {
	var name = note.getAttribute('name') || ('note_' + noNameNoteCount++),
		parameters = localStorage.getItem(name) || '';
		
	ReactDom.render(
		<Notes name={name} elem={note}/>,
		note
	)
})
