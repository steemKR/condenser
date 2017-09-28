/* eslint react/prop-types: 0 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {api} from 'steem';

class TagUserSearchSelect extends React.Component {

    static propTypes = {
    };

    constructor() {
        super();
        this.state = {};
    }

    search(input) {
        console.log(input);
        if (!input || input.length < 1) {
            return Promise.resolve({ options: [] });
        }

        const symbol = input.charAt(0);
        const isUser = symbol === '@';
        const isTag = symbol === '#';

        // TODO: remove below and make searching post enable.
        if (input.length < 2 || !(isUser || isTag)) {
            return Promise.resolve({ options: [] });
        }

        const keyword = isUser || isTag ? input.slice(1) : input;

        const url = isUser ? '/api/v1/search/users' : '/api/v1/search/tags';
        return fetch(url, {
            method: 'post',
            mode: 'no-cors',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ keyword })
        })
        .then(r => r.json())
        .then(res => {
            if (res.error) {
                throw new Error(status);
            }
            const options = res.sort((a,b) => {
                return a.localeCompare(b);
            }).map(v => {
                return {
                    value: `${symbol}${v}`,
                    label: `${symbol}${v}`,
                };
            })
            console.log(options);

            return { options };
        })
    }

    onChange(option) {
        const symbol = option.value.charAt(0);
        const isUser = symbol === '@';
        const isTag = symbol === '#';

        const v = option.value.slice(1);
        const link = isUser ? `/@${v}` : `/trending/${v}`;

        window.open(link);
    }

    render() {
        return (
            <Select.Async
              loadOptions={this.search.bind(this)}
              onChange={this.onChange.bind(this)}
              autoBlur
              placeholder='@유저, #태그'
              clearable={false}
            />
        );
    }
}

export default TagUserSearchSelect;
