var React = require('react'),
	l = console.log;

import css from './notes.css';	


class Notes extends React.Component{
	constructor(props){
		super(props)

		// save elem
		this.elem = this.props.elem

		//

		// look in storage
		var localProps = localStorage.getItem(this.props.name)
		if(localProps){
			localProps = JSON.parse(localProps)
		} else {
			l('create localProps')
			localProps = {
				text: '',
				position: {
					x : 0,
					y : 0,
				},
				size: {
					width: undefined,
					heigth: undefined,
				},
				collapse: true,
			}
		}

		// create starting state
		this.state = {
			name: this.props.name,
			position: {
				x: localProps.position.x,
				y: localProps.position.y
			},
			collapse: localProps.collapse,
			edit: false,
		}
	}

	//main listeners
	componentDidMount(){
		var localParameters = localStorage.getItem('name'),
			elem = this.elem,
			elements,
			that = this;


		elem.classList = ['app'];

		this.elements = {
			wrapper: elem.querySelector('.note-component'),
			header: elem.querySelector('.note-component__header'),
			collapseBtn: elem.querySelector('.note-component__collapse-btn'),
			main: elem.querySelector('.note-component__main'),
			textarea: elem.querySelector('.note-component__area'),
			resizer: elem.querySelector('.note-component__resizer')
		}

		elements = this.elements;

		if(this.state.collapse){
			collapseNote()
			setTimeout(checkWindowSizeAndChangeNotePosition, 1000)
		} else {
			checkWindowSizeAndChangeNotePosition()
		}
		

		elem.addEventListener('mousedown', function(e){
			var target = e.target;
			if(!target) return

			that.setState({
				edit:true,
			})

			document.addEventListener('mouseup', removeEditProp)
			function removeEditProp(){
				document.removeEventListener('mouseup', removeEditProp)
				that.setState({
					edit:false,
				})
			}

			if(target == elements.header){
				dragNote(e) 
				return
			}

			if(target == elements.resizer){
				l('resizer')
			}
		})

		elem.addEventListener('click', function(e){
			var target = e.target;
			if(!target) return

			if(target == elements.collapseBtn){
				that.setState(function(prevState, props){
					if(prevState.collapse == true){
						expandNote()
						return {
							collapse: false,
						}
					} else {
						collapseNote()
						return{
							collapse: true,
						}
					}
				})
			}	
		})

		function dragNote(e){
			var draged = false,
				offset,
				startPosition = {
					x: e.clientX,
					y: e.clientY,
				};
			
			document.body.addEventListener('mousemove', moveNote)
			document.body.addEventListener('mouseup', removeListeners);

			function moveNote(e){
				if(!draged){
					if( (Math.abs(e.clientX - startPosition.x) < 2) && 
						(Math.abs(e.clientY - startPosition.y) < 2)){
						return
					} else {
						draged = true
						offset = {
							x: e.clientX - elements.header.getBoundingClientRect().left,
							y: e.clientY - elements.header.getBoundingClientRect().top,
						}
					}
				
				} 

				var resultPosition = {
					x : e.clientX - offset.x, 
					y : e.clientY - offset.y,
				}

				resultPosition = checkWindowSizeAndNotePosition(resultPosition.x, resultPosition.y)

				that.setState({
					position: {
						x: resultPosition.x,
						y: resultPosition.y
					}
				})
			}

			function removeListeners(){
				document.body.removeEventListener('mousemove', moveNote)
				document.body.removeEventListener('mouseup', removeListeners);
			}
		}

		function collapseNote(){
			var main = that.elements.main;

			main.style.maxHeight = main.scrollHeight + 'px';
			setTimeout(function(){
				main.style.maxHeight = '0px'
			},100)
		}

		function expandNote(){
			var main = that.elements.main;

			//check note near bottom
			checkWindowSizeAndChangeNotePosition()
			/*if(document.documentElement.clientHeight - main.getBoundingClientRect().bottom < main.scrollHeight){
				wrapper.style.transition = '1s';
				var diffY = main.scrollHeight - (document.documentElement.clientHeight - main.getBoundingClientRect().bottom),
					diffX = main.scrollWidth - (document.documentElement.clientWidth - main.getBoundingClientRect().right);
				
				that.setState(function(prevState, props){
					return {
						position: {
							y: prevState.position.y - diffY,
							x: prevState.position.x - diffX,
						}
					}
				})

				setTimeout(function(){
					wrapper.style.transition = '';
				}, 1000)
			}*/

			main.style.maxHeight = main.scrollHeight + 'px';
		}

		function checkWindowSizeAndNotePosition(x, y){
			var wrapper = that.elements.wrapper

			if(x + wrapper.offsetWidth > document.documentElement.clientWidth){
				x = document.documentElement.clientWidth - wrapper.offsetWidth 
			}
			if(x < 0) x = 0

			if(y + wrapper.offsetHeight > document.documentElement.clientHeight){
				y = document.documentElement.clientHeight - wrapper.offsetHeight 
			}
			if(y < 0) y = 0

			return {
				x: x,
				y: y
			}
		}

		function checkWindowSizeAndChangeNotePosition(){
			var main = that.elements.main,
				wrapper = that.elements.wrapper;

			var diffX, diffY;
			/*if(document.documentElement.clientHeight - main.getBoundingClientRect().top < main.scrollHeight){
				wrapper.style.transition = '1s';
				var diffY = main.scrollHeight - (document.documentElement.clientHeight - main.getBoundingClientRect().top),
					diffX = main.scrollWidth - (document.documentElement.clientWidth - main.getBoundingClientRect().right);
				
				l('diffX : ', diffX)

				that.setState(function(prevState, props){
					return {
						position: {
							y: prevState.position.y - diffY,
							x: prevState.position.x //- diffX,
						}
					}
				})

				setTimeout(function(){
					wrapper.style.transition = '';
				}, 1000)
			}*/
		}

	}

	render(){
		localStorage.setItem(this.state.name, JSON.stringify(this.state));

		var collapseClass = this.state.collapse ? 'note-component--collapsed' : '',
			editClass = this.state.edit ? 'edit' : '',
			componentClass = "note-component " + collapseClass + ' ' + editClass;

		if(this.state.edit){
			document.body.style.position = 'fixed'
			document.body.style.overflowY = 'scroll'
		} else {
			document.body.style.position = ''
			document.body.style.overflowY = ''
		}

		return (
			<div className={componentClass} style={{
				left: (this.state.position.x || 0) + 'px',
				top: (this.state.position.y || 0) + 'px' 
			}}>
				<div className="note-component__header" name={this.state.name}>
					<button className="note-component__collapse-btn" />
				</div>

				<div className="note-component__main"> 

					<textarea className="note-component__area">{this.state.text}</textarea>
					<div className="note-component__scroll-wrapper">
						<div className="note-component__scroll"/>
					</div>
					<div className="note-component__resizer"/>

				</div>
			</div>
		)
	}
}	


module.exports = Notes;