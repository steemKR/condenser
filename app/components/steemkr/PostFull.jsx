import React from 'react'
import googleTranslateTextTo from 'app/utils/GoogleTranslator';
import PostFull from '../PostFull'

export default class PostFull extends React.Component {
  constructor() {
    super();
    this.state = {
      translating: false,
      translated: false,
    };
  }

  transFormContent = (content) => {

  }
  
  toggleTranslatePostTo = ({ title, body, to }) => {
    if (this.state.translating) return;
    if (this.state.translated) {
      this.setState({ translated: false });
    } else {
      if (this.state.translatedResult) {
        this.setState({ translating: false, translated: true })
        return
      }

      this.setState({ translating: true });
      googleTranslateTextTo({text: [title, body], to })
        .then((result) => {
          this.setState({
            translating: false,
            translated: true,
            translatedResult: {
              title: result.text[0],
              body: result.text[1],
            }
          })
        })
        .catch(() => this.setState({translating: false}))
    }
  }


  render() {




    return (
      <div>
        <button className="float-right button hollow tiny" onClick={() => this.toggleTranslatePostTo({ body: content_body, title: content.title, to: 'ko' })}>
          { this.state.translated ? "원본 보기" : "한국어로 번역하기" }
        </button>
        <PostFull {...this.props} />
      </div>
    )
  }
}
