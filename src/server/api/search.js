/*global $STM_Config */
import koa_router from 'koa-router';
import koa_body from 'koa-body';
import models from 'db/models';
import findUser from 'db/utils/find_user';
import config from 'config';
import recordWebEvent from 'server/record_web_event';
import {esc, escAttrs} from 'db/models';
import {emailRegex, getRemoteIp, rateLimitReq, checkCSRF} from 'server/utils/misc';
import coBody from 'co-body';
import Mixpanel from 'mixpanel';
import Tarantool from 'db/tarantool';
import {PublicKey, Signature, hash} from 'steem/lib/auth/ecc';
import {api, broadcast} from 'steem';
import google from 'googleapis';
import { union } from 'lodash';

const sheets = google.sheets('v4')

const krTagListCache = {
    data: null,
    updatedAt: new Date(),
};

function getKRTags() {
    const now = new Date();
    const HOUR = 1000 * 60 * 60;

    if (krTagListCache.data && now - krTagListCache.updatedAt < HOUR) {
        return Promise.resolve(krTagListCache.data);
    }

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            // TODO: API key from env
            auth: 'AIzaSyAbmPJfm1X0_8pUbwRv9qPUpNZyh526ngA',
            spreadsheetId: '1ugtsCnnNa0jQ7_6EbLIsSOrSTicbKUAmmyaW7Vu0Vsg',
            range: 'A3:D',
        }, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            krTagListCache.data = res;
            krTagListCache.updatedAt = new Date();
            resolve(res);
        });
    })
}

export default function useSearchApi(app) {
    const router = koa_router({prefix: '/api/v1'});
    app.use(router.routes());
    const koaBody = koa_body();

    router.post('/search/tags', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;
        const params = this.request.body;
        const {keyword} = typeof(params) === 'string' ? JSON.parse(params) : params;

        console.log('-- /search/tags -->', this.session.uid, keyword);

        // TODO: cache the result by keyword

        try {
            const result = yield getKRTags();
            const krTags = result.values
                .map(r => r[0])
                .filter(t => t.startsWith(keyword));

            const trendingTags = yield api.getTrendingTagsAsync(keyword, 20);

            const tags = union(krTags, trendingTags.map(t => t.name));

            this.body = JSON.stringify(tags);
        } catch(e) {
            console.error('The Google Sheets API returned an error: ' + e);
            this.body = JSON.stringify({error: e});
            this.status = 500;
        }

        recordWebEvent(this, 'api/tags/kr', '');
    });

    router.post('/search/users', koaBody, function *() {
        if (rateLimitReq(this, this.req)) return;

        const params = this.request.body;
        const {keyword} = typeof(params) === 'string' ? JSON.parse(params) : params;

        console.log('-- /search/users -->', this.session.uid, keyword);

        // TODO: cache the result by keyword

        try {
            const users = yield api.lookupAccountsAsync(keyword, 20);
            this.body = JSON.stringify(users);
        } catch(e) {
            this.body = JSON.stringify(e);
            this.status = 500;
        }

        recordWebEvent(this, 'api/users', '');
    })
}
