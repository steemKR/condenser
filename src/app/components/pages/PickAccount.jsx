/* eslint react/prop-types: 0 */
/*global $STM_csrf, $STM_Config */
import React from 'react';
import {connect} from 'react-redux';
import user from 'app/redux/User';
import {api} from '@steemit/steem-js';
import {validate_account_name} from 'app/utils/ChainValidation';
import runTests from 'app/utils/BrowserTests';
import Progress from 'react-foundation-components/lib/global/progress-bar';
import { Link } from 'react-router';

class PickAccount extends React.Component {

    static propTypes = {
        loginUser: React.PropTypes.func.isRequired,
        serverBusy: React.PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            password: '',
            password_valid: '',
            name_error: '',
            server_error: '',
            loading: false,
            cryptographyFailure: false,
            showRules: false,
            subheader_hidden: true
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
    }

    componentDidMount() {
        const cryptoTestResult = runTests();
        if (cryptoTestResult !== undefined) {
            console.error('CreateAccount - cryptoTestResult: ', cryptoTestResult);
            this.setState({cryptographyFailure: true}); // TODO: do not use setState in componentDidMount
        }
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({server_error: '', loading: true});
        const {name} = this.state;
        if (!name) return;

        window.location = "/enter_email?account=" + name;
    }

    onPasswordChange(password, password_valid) {
        this.setState({password, password_valid});
    }

    onNameChange(e) {
        const name = e.target.value.trim().toLowerCase();
        this.validateAccountName(name);
        this.setState({name});
    }

    validateAccountName(name) {
        let name_error = '';
        let promise;
        if (name.length > 0) {
            name_error = validate_account_name(name);
            if (!name_error) {
                this.setState({name_error: ''});
                promise = api.getAccountsAsync([name]).then(res => {
                    return res && res.length > 0 ? 'Account name is not available' : '';
                });
            }
        }
        if (promise) {
            promise
                .then(name_error => this.setState({name_error}))
                .catch(() => this.setState({
                    name_error: "Account name can't be verified right now due to server failure. Please try again later."
                }));
        } else {
            this.setState({name_error});
        }
    }

    render() {
        if (!process.env.BROWSER) { // don't render this page on the server
            return <div className="row">
                <div className="column">
                    <p className="text-center">LOADING..</p>
                </div>
            </div>;
        }

        const {
            name, name_error, server_error, loading, cryptographyFailure
        } = this.state;

        const {loggedIn, logout, offchainUser, serverBusy} = this.props;
        const submit_btn_disabled = loading || !name || name_error;
        const submit_btn_class = 'button action' + (submit_btn_disabled ? ' disabled' : '');

        const account_status = offchainUser ? offchainUser.get('account_status') : null;

        return (
            <div>
                <div className="CreateAccount row">
                    <div className="column" style={{maxWidth: '36rem', margin: '0 auto'}}>
                        <br/>
                        <h3>STEEM의 계정생성</h3>
                        <p>
                            STEEM 블록체인에서 계정을 생성하고 사용하기 위해서는 <b>STEEM</b>이 필요합니다. 
                            이는 다른 암호화폐들이 수수료를 지불하는 것과는 달리 <b>스팀은 수수료가 없으며</b>, 
                            스팀파워를 통해서 사용자가 가지고 있는 <b>대역폭 만큼만 데이터를 사용</b>할 수 있기 때문입니다.<br /><br />
                            <b>Steemit Inc.</b>는 계정을 생성하기 위한 기금을 보유하고 있으며,
                            이미 스팀 계정을 가지고 있는 사람의 스팀과 스팀파워를 사용하여 계정을 생성할 수 있습니다.
                            이처럼 현재 계정 생성을 지원하는 서비스들을 소개해드리겠습니다.
                            <br/>
                            <br />
                            <b>계정을 생성한 뒤, 반드시 암호를 변경하여 사용하시기 바랍니다. 모든 암호 관리의 책임은 개인에게 있으며, <a target="_blank" href="https://bookchain.gitbooks.io/steem-bluepaper/content/ko-KR/Bluepaper.html#도난-계정-복구">스팀의 유일한 계정 복구 프로세스</a>외에는 별도로 계정을 복구할 수단이 없습니다.</b>
                        </p>
                        <br />
                        <h4>Steemit Inc.를 통해서 계정 생성하기</h4>
                        <a target="_blank" href="https://signup.steemit.com"><button className="button">계정 생성하기</button></a>
                        <br />
                        <h4>직접 계정 생성하기</h4>
                        <p>
                            스팀 또는 다른 암호화폐들을 이용하여 직접 스팀 계정을 생성하실 수 있습니다. 이러한 기능을 제공하고 있는 웹사이트들은 아래와 같습니다.
                        </p>
                        <a target="_blank" href="https://anon.steem.network/"><button className="button">anon.steem.network 사용하기</button></a>
                        <a target="_blank" href="https://blocktrades.us/create-steem-account"><button className="button">blockTradues.us 사용하기</button></a>
                        <a target="_blank" href="https://nhj7.github.io/steem.apps/#AccountCreator"><button className="button">nhj7.github.io/steem.apps 사용하기</button></a>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'pick_account',
    component: connect(
        state => {
            return {
                loggedIn: !!state.user.get('current'),
                offchainUser: state.offchain.get('user'),
                serverBusy: state.offchain.get('serverBusy')
            }
        },
        dispatch => ({
            loginUser: (username, password) => dispatch(user.actions.usernamePasswordLogin({username, password, saveLogin: true})),
            logout: e => {
                if (e) e.preventDefault();
                dispatch(user.actions.logout())
            }
        })
    )(PickAccount)
};
