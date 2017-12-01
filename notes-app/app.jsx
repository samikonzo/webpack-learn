var ReactDom = require('react-dom'),
	React = require('react'),
	Notes = require('./components/notes.jsx');


var noNameNoteCount = 0;

[].forEach.call(document.querySelectorAll('.note'), (note, i) => {
	var name = note.getAttribute('name') || ('note_' + noNameNoteCount++);
	
	/*
	if(!i){
		ReactDom.render(
			<Notes name={name} elem={note} first="true" />,
			note
		)
		return
	}	*/

	ReactDom.render(
		<Notes name={name} elem={note}/>,
		note
	)
})
