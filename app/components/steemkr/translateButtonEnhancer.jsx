import React from 'react'
import googleTranslateTextTo from 'app/utils/GoogleTranslator';

const isBrowser = typeof window !== 'undefined';

export default function translateButtonEnhancer(Comp, {titleSelector, bodySelector, style}) {
  return class extends React.Component {
    constructor() {
      super();
      this.state = {
        translating: false,
        translated: false,
      };
    }

    transformContent = (content) => {
      if (!isBrowser) return;

      content.body = (content.body || '').replace(/https:\/\/steemit\.com/ig, location.origin);
    }

    toggleTranslatePost = (to) => {
      const { rootElement } = this;

      if (this.state.translating) return;
      let titleElement, titleText;
      if (titleSelector) {
        titleElement = rootElement.querySelector(titleSelector)
        titleText = titleElement.textContent
      }
      const bodyElement = rootElement.querySelector(bodySelector)
      const bodyContent = bodyElement.innerHTML

      if (this.state.translated) {
        if (titleSelector) titleElement.textContent = this._original.title;
        bodyElement.innerHTML = this._original.body;
        this.setState({ translating: false, translated: false });
      } else {
        if (this._translated) {
          if (titleSelector) titleElement.textContent = this._translated.title;
          bodyElement.innerHTML = this._translated.body;
          this.setState({ translating: false, translated: true })
          return;
        }

        this.setState({ translating: true });
        googleTranslateTextTo({title: titleText, bodyContent, to })
          .then((result) => {
            this._translated = { title: result.title, body: result.bodyContent };
            this._original = { title: titleText, body: bodyContent };

            if (titleSelector) titleElement.textContent = this._translated.title;
            bodyElement.innerHTML = this._translated.body;

            this.setState({ translating: false, translated: true });
          })
          .catch(() => this.setState({translating: false}))
      }
    }


    render() {
      return (
        <div ref={e => this.rootElement = e} style={{position: 'relative'}}>
          <button style={style} className="button hollow tiny" onClick={() => this.toggleTranslatePost('ko')}>
            { this.state.translated ? "원본 보기" : "한국어로 번역하기" }
          </button>
          <Comp {...this.props} transformContent={this.transformContent} />
        </div>
      )
    }
  }
}
