import React from 'react';
import {connect} from 'react-redux'
import {IntlProvider, addLocaleData} from 'react-intl';
import {DEFAULT_LANGUAGE} from 'app/client_config';
import tt from 'counterpart';

import intlLocale_en from 'react-intl/locale-data/en';
import intlLocale_ko from 'react-intl/locale-data/ko';

addLocaleData([...intlLocale_en, ...intlLocale_ko]);
tt.setFallbackLocale('en');

const en = require('app/locales/en.json');
const ko = require('app/locales/ko.json');
const localeDefaults = {
  counterpart: {
    pluralize: (entry, count) => entry[
      (count === 0 && 'zero' in entry)
        ? 'zero' : (count === 1) ? 'one' : 'other'
    ],
    formats: {
      date: {
        default: '%Y-%m-%d',
        long: '%Y년 %m월 %d일 %e',
        short: '%Y-%m-%d'
      },
      time: {
        default: '%H:%M',
        long: '%H:%M:%S %z',
        short: '%H:%M'
      },
      datetime: {
        default: '%Y-%m-%d %H:%M',
        long: '%Y년 %m월 %d일 %e %H:%M:%S',
        short: '%Y-%m-%d %H:%M'
      }
    }
  }
}
tt.registerTranslations('en', en);
tt.registerTranslations('ko', Object.assign({}, en, ko, localeDefaults));


class Translator extends React.Component {
    render() {
        let language = this.props.locale;
        tt.setLocale(language);
        return <IntlProvider
            // to ensure dynamic language change, "key" property with same "locale" info must be added
            // see: https://github.com/yahoo/react-intl/wiki/Components#multiple-intl-contexts
            key={language}
            locale={language}
            defaultLocale={DEFAULT_LANGUAGE}
        >
            {this.props.children}
        </IntlProvider>
    }
}

export default connect(
    (state, ownProps) => {
		const locale = state.user.get('locale');
		tt.setLocale(locale);
        return {...ownProps, locale};
    }
)(Translator);

export const FormattedHTMLMessage = ({id, params, className}) => (
    <div className={'FormattedHTMLMessage' + (className ? ` ${className}` : '')} dangerouslySetInnerHTML={ { __html: tt(id, params) } }></div>
);
