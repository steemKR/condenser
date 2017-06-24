import React from 'react'
import googleTranslateTextTo from 'app/utils/GoogleTranslator';
import PostFull from '../cards/PostFull'

export default class PostFullWrapper extends React.Component {
  constructor() {
    super();
    this.state = {
      translating: false,
      translated: false,
    };
  }

  transformContent = (content) => {
    if (!content) return
    // Replace Steemit to SteemKR
    content.body = content.body.replace(/https:\/\/steemit\.com/ig, location.origin)
  }

  toggleTranslatePost = (to) => {
    if (this.state.translating) return;

    const titleElement = document.querySelector('.PostFull__header .entry-title')
    const titleText = titleElement.textContent
    const bodyElement = document.querySelector('.PostFull__body.entry-content')
    const bodyContent = bodyElement.innerHTML
    const bodyText = bodyElement.textContent

    if (this.state.translated) {
      titleElement.textContent = this._original.title;
      bodyElement.innerHTML = this._original.body;
      this.setState({ translating: false, translated: false });
    } else {
      if (this._translated) {
        titleElement.textContent = this._translated.title;
        bodyElement.innerHTML = this._translated.body;
        this.setState({ translating: false, translated: true })
        return;
      }

      this.setState({ translating: true });
      googleTranslateTextTo({title: titleText, bodyContent, bodyText, to })
        .then((result) => {
          console.log(result)
          this._translated = { title: result.title, body: result.bodyContent };
          this._original = { title: titleText, body: bodyContent };

          titleElement.textContent = this._translated.title;
          bodyElement.innerHTML = this._translated.body;

          this.setState({ translating: false, translated: true });
        })
        .catch(() => this.setState({translating: false}))
    }
  }


  render() {
    return (
      <div>
        <button className="float-right button hollow tiny" onClick={() => this.toggleTranslatePost('ko')}>
          { this.state.translated ? "원본 보기" : "한국어로 번역하기" }
        </button>
        <PostFull {...this.props} transformContent={this.transformContent} />
      </div>
    )
  }
}
