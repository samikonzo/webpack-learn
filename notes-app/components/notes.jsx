var React = require('react'),
	l = console.log;

import css from './notes.css';	
l(css)

class Notes extends React.Component{
	constructor(props){
		super(props)

		this.elem = this.props.elem

		this.state = {
			text: this.props.text,
			name: this.props.name,
		}


	}

	componentDidMount(){
		var localParameters = localStorage.getItem('name')

		l(this.state)

		this.elem.classList = ['app'];


		var elem = this.elem
		elem.addEventListener('mousedown', function(e){
			l(e.target)
		})


	}

	render(){
		return (
			<div className="note-component">
				<div className="note-component__header">
					<button className="note-component__collapse-btn" />
				</div>
				<textarea className="note-component__area">{this.state.text}</textarea>
				<div className="note-component__resizer"/>
			</div>
		)
	}
}	


module.exports = Notes;