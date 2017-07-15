import React from 'react';
import {connect} from 'react-redux'
import {IntlProvider} from 'react-intl';
import {DEFAULT_LANGUAGE} from 'app/client_config';

// most of this code creates a wrapper for i18n API.
// this is needed to make i18n future proof

/*
	module exports bunch of functions: translate, translateHtml and so on
	usage example:
	translate('reply_to_user', {username: 'undeadlol1') == 'Reply to undeadlol1'
	translateHtml works the same, expcept it renders string with html tags in it
*/

// locale data is needed for various messages, ie 'N minutes ago'
import enLocaleData from 'react-intl/locale-data/en';
import ruLocaleData from 'react-intl/locale-data/ru';
import frLocaleData from 'react-intl/locale-data/fr';
import esLocaleData from 'react-intl/locale-data/es';
import itLocaleData from 'react-intl/locale-data/it';
import koLocaleData from 'react-intl/locale-data/ko';
addLocaleData([...enLocaleData, ...ruLocaleData, ...frLocaleData, ...esLocaleData, ...itLocaleData, ...koLocaleData]);

// Our translated strings
import { ru } from './locales/ru';
import tt from 'counterpart';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { it } from './locales/it';
import { ko } from './locales/ko';
const messages = {ru, en, fr, es, it, ko}

/*
	exported function placeholders
 	this is needed for proper export before react-intl functions with locale data,
	will be properly created (they depend on react props and context),
	which is not available until component is being created
*/
/*
	this placeholder is needed for usage outside of react. In server side code and in static html files.
	This function is very simple, it does NOT support dynamic values (for example: translate('your_email_is', {email: 'x@y.com'})). Use it carefully
*/
let translate = string => {
	let language = DEFAULT_LANGUAGE
	if (process.env.BROWSER) language = store.get('language') || DEFAULT_LANGUAGE
	return messages[language][string]
};
let translateHtml = () => {}; // NOTE: translateHtml() rarely works properly, prefer using translate()
let translatePlural = () => {};
let translateNumber = () => {};

// react-intl's formatMessage and formatHTMLMessage functions depend on context(this is where strings are stored)
// thats why we:
// 1) create instance of <IntlProvider /> which wraps our application and creates react context (see "Translator" component below)
// 2) create <DummyComponentToExportProps /> inside <IntlProvider /> (the "Translator" component)
// 3) now we have proper context which we use to export translate() and translateHtml() to be used anywhere
// all of this shenanigans are needed because many times translations are needed outside of components(in reducers and redux "connect" functions)
// but since react-intl functions depends on components context it would be not possible

@injectIntl // inject translation functions through 'intl' prop
class DummyComponentToExportProps extends React.Component {

	render() { // render hidden placeholder
		return <span hidden>{' '}</span>
	}

	// ⚠️ IMPORTANT
	// use 'componentWillMount' instead of 'componentDidMount',
	// or there will be all sorts of partially rendered components
	componentWillMount() {
		// assign functions after component is created (context is picked up)
		translate = 	(...params) => this.translateHandler('string', ...params)
		translateHtml = (...params) => this.translateHandler('html', ...params)
		translatePlural = (...params) => this.translateHandler('plural', ...params)
		translateNumber = (...params) => this.translateHandler('number', ...params)
	}

tt.registerTranslations('en', require('app/locales/en.json'));

class Translator extends React.Component {
    render() {
        let language = this.props.locale;
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
        return {...ownProps, locale};
    }
)(Translator);

export const FormattedHTMLMessage = ({id, params, className}) => (
    <div className={'FormattedHTMLMessage' + (className ? ` ${className}` : '')} dangerouslySetInnerHTML={ { __html: tt(id, params) } }></div>
);
