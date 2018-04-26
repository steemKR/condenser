import React from 'react';
import {connect} from 'react-redux';
import SvgImage from 'app/components/elements/SvgImage';
import AddToWaitingList from 'app/components/modules/AddToWaitingList';

class SignUp extends React.Component {
    constructor() {
        super();
        this.state = {waiting_list: false};
    }
    render() {
        if ($STM_Config.read_only_mode) {
            return <div className="row">
                <div className="column">
                    <div className="callout alert">
                        <p>Due to server maintenance we are running in read only mode. We are sorry for the inconvenience.</p></div>
                </div>
            </div>;
        }
        
        if (this.props.serverBusy || $STM_Config.disable_signups) {
            return <div className="row">
                <div className="column callout" style={{margin: '20px', padding: '40px'}}>
                    <p>Membership to Steemit.com is now under invitation only because of unexpectedly high sign up rate.
                        Submit your email to get on the waiting list.</p>
                    <AddToWaitingList />
                </div>
            </div>;
        }

        return <div className="SignUp">
            <div className="row">
                <div className="column">
                    <h3>Sign Up via <a href="https://signup.steemit.com">signup.steemit.com</a></h3>
                    <p>Steemit Inc는 계정 생성을 위한 기금을 관리하고 있으며, 이를 통해 무료로 계정을 생성하실 수 있습니다.</p>
                </div>
            </div>
        </div>
    }
}

export default connect(
    state => {
        return {
            signup_bonus: state.offchain.get('signup_bonus'),
            serverBusy: state.offchain.get('serverBusy')
        };
    }
)(SignUp);
