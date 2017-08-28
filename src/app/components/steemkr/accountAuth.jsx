import React, {PropTypes, Component} from 'react';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {connect} from 'react-redux';
import user from 'app/redux/User';
import tt from 'counterpart';
import g from 'app/redux/GlobalReducer';

/** Display a public key.  Offer to show a private key, but only if it matches the provided public key */
class AccountAuth extends Component {
    static propTypes = {
        // HTML props
        pubkey: PropTypes.string.isRequired,
        authType: PropTypes.string.isRequired,
        accountName: PropTypes.string.isRequired,
        showLogin: PropTypes.func.isRequired,
        privateKey: PropTypes.object,
        cmpProps: PropTypes.object,
        children: PropTypes.object,
        onKey: PropTypes.func,
    }
    constructor() {
        super()
        this.state = {}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'ShowKey')
        this.onShow = () => {
            const {state: {show}} = this
            const {name} = this.props
            this.setState({show: !show})
        }
        this.showLogin = () => {
            const {showLogin, accountName, authType} = this.props
            showLogin({username: accountName, authType})
        }
        this.showLogin = this.showLogin.bind(this)
    }
    showAccount = () => {
        const {name} = this.state;
        this.props.showAccount({type: this.props.authType, text: name});
    }
    render() {
        const {onShow, showLogin, props: {name, cmpProps, children, authType}} = this
        const {show} = this.state

        const keyIcon = <span style={{fontSize: '100%'}}>{tt('g.hide_private_key')}</span>
        // Tooltip is trigggering a setState on unmounted component exception
        const showTip = tt('g.show_private_key')//<Tooltip t="Show private key (WIF)">show</Tooltip>


        return (<div className="row">
            <div className="column small-12 medium-10">
                <div style={{display: "inline-block", paddingRight: 10, cursor: "pointer"}} onClick={this.showAccount}>
                    <img src={require("app/assets/images/qrcode.png")} height="40" width="40" />
                </div>
                {/* Keep this as wide as possible, check print preview makes sure WIF it not cut off */}
                <span {...cmpProps}>{name}</span>
            </div>
            <div className="column small-12 medium-2 noPrint">
                
            </div>
            {/*<div className="column small-1">
                {children}
            </div>*/}
        </div>)
    }
}
export default connect(
    (state, ownProps) => ownProps,
    dispatch => ({
        showLogin: ({username, authType}) => {
            dispatch(user.actions.showLogin({loginDefault: {username, authType}}))
        },
        showAccount: ({type, account}) => {
            // dispatch(g.actions.showDialog({name: "qr_key", params: {type, isPrivate, text}}));
        }
    })
)(AccountAuth)
