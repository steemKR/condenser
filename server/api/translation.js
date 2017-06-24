import koa_router from 'koa-router';
import koa_body from 'koa-body';
import translate from 'google-translate-api'
import { rateLimitReq } from 'server/utils/misc';

export default function useTranslationApi(app) {
    const router = koa_router({prefix: '/api/v1'});
    app.use(router.routes());
    const koaBody = koa_body();

    router.post('/translation', koaBody, function *() {
      if (rateLimitReq(this, this.req)) return;

      const body = this.request.body;

      let text = body.text;
      const to = body.to;

      if (!Array.isArray(text)) {
        text = [text];
      }

      try {
        let result = null;
        for (const t of text) {
          if (!result) {
            result = yield translate(t, { to });
          } else {
            const moreResult = yield translate(t, { to });
            if (!Array.isArray(result.text)) {
              result.text = [result.text]
            }
            result.text.push(moreResult.text);
          }
        }

        this.body = result;
      } catch (e) {
        console.error(e);
        this.body = e;
      }
    });
}
