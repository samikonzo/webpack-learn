var React = require('react'),
	l = console.log;

import css from './notes.css';	



class Notes extends React.Component{
	constructor(props){
		super(props)

		// save elem
		this.elem = this.props.elem

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
					height: undefined,
				},
				collapse: true,
			}
		}

		// create starting state
		this.state = {
			text: localProps.text,
			name: this.props.name,
			position: {
				x: localProps.position.x,
				y: localProps.position.y
			},
			size : {
				width: localProps.size.width,
				height: localProps.size.height,
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

		//resizing if no startSize
		if(this.state.size.width == undefined || this.state.size.height == undefined){
			this.state.size.width = getComputedStyle(elements.wrapper).width
			this.state.size.height = getComputedStyle(elements.wrapper).height
		}

		if(this.state.collapse){
			collapseNote()
			//setTimeout(checkWindowSizeAndChangeNotePosition, 1000)
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
				resizeNote(e)
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

		elements.textarea.addEventListener('focus', function(e){
			var textarea = this;

			textarea.addEventListener('keydown', textareaListenKeys);
			textarea.addEventListener('blur', changeText)


			function textareaListenKeys(e){
				l('keydown')
				const keyCode_esc = 27,
					keyCode_enter = 13;	

				if(e.keyCode == keyCode_enter){
					//changeText()
				} else if(e.keyCode == keyCode_esc){
					returnText()
				}	
			}	

			function changeText(){
				if(textarea.value != that.state.text){
					that.setState({
						text: textarea.value
					})
				l(textarea.value)
				}

				endOfChanging();
			}

			function returnText(){
				textarea.value = that.state.text

				endOfChanging();
			}

			function endOfChanging(){
				textarea.removeEventListener('keydown', textareaListenKeys);
				textarea.removeEventListener('blur', changeText)
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
			document.body.addEventListener('mouseup', removeListeners)

			function moveNote(e){
				if(!draged){
					if( (Math.abs(e.clientX - startPosition.x) < 0) && 
						(Math.abs(e.clientY - startPosition.y) < 0)){
						return
					} else {
						draged = true
						offset = {
							x: e.clientX - elements.header.getBoundingClientRect().left,
							y: e.clientY - elements.header.getBoundingClientRect().top,
						}
					}
				
				} 

				if(that.state.savedPosition){
					delete that.state.savedPosition
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
				document.body.removeEventListener('mouseup', removeListeners)
			}
		}

		function resizeNote(e){
			var startPosition = {
					x: e.clientX,
					y: e.clientY,
				},
				startSize = {
					width: parseFloat(getComputedStyle(elements.wrapper).width, 10),
					height: parseFloat(getComputedStyle(elements.wrapper).height, 10),
				};

			document.addEventListener('mousemove', changeSizeNote)
			document.addEventListener('mouseup', removeListeners)
				
			function changeSizeNote(e){
				var differencePosition = {
					x: e.clientX - startPosition.x,
					y: e.clientY - startPosition.y
				}

				that.setState({
					size: {
						width: startSize.width + differencePosition.x,
						height: startSize.height + differencePosition.y,
					}
				})
			}

			function removeListeners(){
				document.removeEventListener('mousemove', changeSizeNote)
				document.removeEventListener('mouseup', removeListeners)
			}

		}

		function collapseNote(){
			var main = that.elements.main;

			main.style.maxHeight = main.scrollHeight + 'px';
			setTimeout(function(){
				
				if(that.state.savedPosition != undefined){
					changePosition(that.state.savedPosition.x, that.state.savedPosition.y, 1000)
					setTimeout(function(){
						main.style.maxHeight = '0px'
					}, 100)

				} else {

					main.style.maxHeight = '0px'
				}
			},100)
		}

		function expandNote(){
			var main = that.elements.main;

			//check note near bottom
			checkWindowSizeAndChangeNotePosition()

			main.style.maxHeight = main.scrollHeight + 'px';
			setTimeout(function(){
				main.style.maxHeight = ''
			}, 1000)
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
			if(document.documentElement.clientHeight - main.getBoundingClientRect().top < main.scrollHeight){
				wrapper.style.transition = '1s';
				var diffY = main.scrollHeight - (document.documentElement.clientHeight - main.getBoundingClientRect().top),
					diffX = main.scrollWidth - (document.documentElement.clientWidth - main.getBoundingClientRect().right);
				
				that.setState(function(prevState, props){
					return {
						savedPosition: {
							y: prevState.position.y,
							x: prevState.position.x,
						},
						position: {
							y: prevState.position.y - diffY,
							x: prevState.position.x //- diffX,
						}
					}
				})

				setTimeout(function(){
					wrapper.style.transition = '';
				}, 1000)
			}
		}

		function changePosition(x,y, ms){
			elements.wrapper.style.transition = ms/1000 + 's'

			setTimeout(function(){
				that.setState({
					position:{
						x: x,
						y: y,
					}
				})

				setTimeout(function(){
					elements.wrapper.style.transition = ''
				}, ms)
			}, 100)
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
			document.body.style.userSelect = 'none'
		} else {
			document.body.style.position = ''
			document.body.style.overflowY = ''
			document.body.style.userSelect = ''
		}

		return (
			<div className={componentClass} style={{
				left: (this.state.position.x || 0) + 'px',
				top: (this.state.position.y || 0) + 'px',
				
			}}>
				<div className="note-component__header" name={this.state.name}>
					<button className="note-component__collapse-btn" />
				</div>

				<div className="note-component__main"> 

					<textarea className="note-component__area" defaultValue={this.state.text} style={{
						width: this.state.size.width + 'px',
						height: this.state.size.height + 'px',
					}}/>
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