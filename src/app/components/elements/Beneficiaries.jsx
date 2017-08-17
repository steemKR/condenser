/* eslint react/prop-types: 0 */
import React from 'react';
import DropdownMenu from 'app/components/elements/DropdownMenu';

export default class Beneficiaries extends React.Component {
    render() {
        let {content} = this.props
        const author = content.author;
        const beneficiaries = content.beneficiaries;
        if (beneficiaries.length <= 0) {
            return false;
        }
        let authorWeight = 10000;
        const beneficiariesItems = [];
        beneficiaries.forEach((item) => {
            const weight = item.weight;
            const rate = (weight * 0.01).toFixed(2);
            const account = item.account;
            authorWeight -= weight;
            beneficiariesItems.push({value: account + ' ' + rate +'%', link: '/@' + account});
        })
        const authorRate = (authorWeight * 0.01).toFixed(2);
        beneficiariesItems.push({value: author + ' ' + authorRate+'%', link: '/@' + author});
        return (
            <span>
                {' via ' }
                <DropdownMenu el="div" className="Beneficiaries__dropdown" items={beneficiariesItems}>
                    <span>
                        {beneficiaries[0].account}
                        {beneficiaries.length > 1 && <span>({beneficiaries.length})</span>}
                    </span>
                </DropdownMenu>
            </span>
        );
    }
}