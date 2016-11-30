import React from 'react'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import VerticalMenu from 'app/components/elements/VerticalMenu';

export default class ShareFooter extends React.Component {

    constructor(props){
        super(props);
        this.state = {isHide:false};
        this.hideBar = this.hideBar.bind(this);
    }

    hideBar(){
        let {isHide} = this.state;
        window.scrollY > this.prev?
        !isHide && this.setState({isHide:true})
            :
        isHide && this.setState({isHide:false});
        this.prev = window.scrollY;
    }

    componentDidMount(){
        window.addEventListener('scroll',this.hideBar);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll',this.hideBar);
    }

    render(){
        let classHide = this.state.isHide ? "shareHidden" : "";
        return <div className={"shareFooter " + classHide}>
            <VerticalMenu items={this.props.menu} />
        </div>;
    }
}
