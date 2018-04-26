/* eslint react/prop-types: 0 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {api} from '@steemit/steem-js';

function debounce(inner, ms = 0) {
  let timer = null;
  let resolves = [];

  return function (...args) {
    // Run the function after a certain amount of time
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Get the result of the inner function, then apply it to the resolve function of
      // each promise that has been created since the last time the inner function was run
      let result = inner(...args);
      resolves.forEach(r => r(result));
      resolves = [];
    }, ms);

    return new Promise(r => resolves.push(r));
  };
}

class TagUserSearchSelect extends React.Component {

    static propTypes = {
    };

    constructor() {
        super();
        this.state = {};

        this.search = debounce(this.search.bind(this), 1000);
        this.onChange = this.onChange.bind(this);
    }

    search(input) {
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
                throw new Error(res.error);
            }
            const options = res.sort((a,b) => {
                return a.localeCompare(b);
            }).map(v => {
                return {
                    value: `${symbol}${v}`,
                    label: `${symbol}${v}`,
                };
            })

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
              loadOptions={this.search}
              onChange={this.onChange}
              autoBlur
              placeholder="@유저이름, 또는 #태그으로 검색하실 수 있습니다"
              clearable={false}
            />
        );
    }
}

export default TagUserSearchSelect;
