# soapbox-fe

> :warning: Not yet ready for production use.

**soapbox-fe** is an alternative frontend for Pleroma.
It's part of the [Soapbox](https://soapbox.pub) project.

It is based on [Gab Social](https://code.gab.com/gab/social/gab-social)'s frontend which is in turn based on [Mastodon](https://github.com/tootsuite/mastodon/)'s frontend.

## How does it work?

soapbox-fe is a [single-page application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) that runs entirely in the browser with JavaScript.

It has a single HTML file, `index.html`, responsible only for loading the required JavaScript and CSS.
It interacts with the backend through [XMLHttpRequest (XHR)](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

It incorporates much of the [Mastodon API](https://docs.joinmastodon.org/methods/) used by Pleroma and Mastodon, but requires many [Pleroma-specific features](https://docs-develop.pleroma.social/backend/API/differences_in_mastoapi_responses/) in order to function.

# Running locally

To get it running, just clone the repo:

```
git clone https://gitlab.com/soapbox-pub/soapbox-fe.git
cd soapbox-fe
```

Ensure that Node.js and Yarn are installed, then install dependencies:

```
yarn
```

Finally, run the dev server:

```
yarn start
```

**That's it!** :tada:

It will serve at `http://localhost:3036` by default.

It will proxy requests to the backend for you.
For Pleroma running on `localhost:4000` (the default) no other changes are required, just start a local Pleroma server and it should begin working.

## Developing against a live backend

You can also run soapbox-fe locally with a live production server as the backend.

> **Note:** Whether or not this works depends on your production server. It does not seem to work with Cloudflare.

To do so, just copy the env file:

```sh
cp .env.example .env
```

And edit `.env`, setting the configuration like this:

```sh
BACKEND_URL="https://pleroma.example.com"
PROXY_HTTPS_INSECURE=true
```

You will need to restart the local development server for the changes to take effect.

## Using with Mastodon

Local Mastodon runs on port 3000 by default, so you will need to edit the `.env` as described above and set it like this:

```
BACKEND_URL="http://localhost:3000"
```

Streaming will not work properly without extra effort.

Due to Mastodon not supporting authentication through the API, you will also need to authenticate manually.
First log in through the Mastodon interface, view the source of the page, and extract your access_token from the markup.
Then open your browser to soapbox-fe (`http://localhost:3036`), open the console, and insert the following code:

```js
window.localStorage.setItem('soapbox:auth:user', JSON.stringify({access_token: "XXX"}));
```

Replace `XXX` with your access token.
Finally, refresh the page, and you should be logged in.

## Local Dev Configuration

The following configuration variables are supported supported in local development.
Edit `.env` to set them.

All configuration is optional.

#### `BACKEND_URL`

URL to the backend server.
Can be http or https, and can include a port.
For https, be sure to also set `PROXY_HTTPS_INSECURE=true`.

**Default:** `http://localhost:4000`

#### `PATRON_URL`

URL to the [Soapbox Patron](https://gitlab.com/soapbox-pub/soapbox-patron) server, if you have one.

This setting is not useful unless `"extensions": { "patron": true }` is also set in `public/soapbox/soapbox.json`.

**Default:** `http://localhost:5000`

#### `PROXY_HTTPS_INSECURE`

Allows using an HTTPS backend if set to `true`.

This is needed if `BACKEND_URL` or `PATRON_URL` are set to an `https://` value.
[More info](https://stackoverflow.com/a/48624590/8811886).

**Default:** `false`

# Yarn Commands

The following commands are supported.

#### Local dev server
- `yarn start` - Run the local dev server. It will proxy requests to the backend for you.

- `yarn dev` - Exact same as above, aliased to `yarn start` for convenience.

#### Building
- `yarn build:development` - Build for development.

- `yarn build:production` - Build for production.

#### Translations
- `yarn manage:translations` - Normalizes translation files. Should always be run after editing i18n strings.

#### Tests
- `yarn test` - Runs all tests.

- `yarn test:lint` - Runs all linter tests.

- `yarn test:lint:js` - Runs only JavaScript linter.

- `yarn test:lint:sass` - Runs only SASS linter.

- `yarn test:jest` - Frontend unit tests.

# License

soapbox-fe is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

soapbox-fe is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with soapbox-fe.  If not, see <https://www.gnu.org/licenses/>.
