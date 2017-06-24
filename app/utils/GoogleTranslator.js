import { compact, flatten } from 'lodash'
import striptags from 'striptags'

const getUrl = (text, from, to) =>
  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from || 'auto'}&tl=${to}&dt=t&q=${encodeURI(text)}`


export default function ({ title, bodyContent, from, to }) {
  const cleanedBodyContent = bodyContent.replace(/&nbsp;/g, ' ');
  const bodyTextSplitted = compact(striptags(cleanedBodyContent, [], '\n').split(/\n|\r|\./))
  const sourceArray = [...[title], ...bodyTextSplitted];

  return Promise
    .all(sourceArray.map((t) => fetch(getUrl(t, from, to)).then(r => r.json())))
    .then((result) => {
      let translatedBodyContent = cleanedBodyContent;
      flatten(result.map(r => r[0]))
        .forEach((r, index) => {
          if (title && index === 0 ) {
            return
          }
          const source = r[1];
          const translated = r[0];

          if (source.match(/^http|^@|^#/))
            return

          translatedBodyContent = translatedBodyContent.replace(source, translated);
        })

      return {
        title: result[0][0][0][0],
        bodyContent: translatedBodyContent,
      }
    })
}
