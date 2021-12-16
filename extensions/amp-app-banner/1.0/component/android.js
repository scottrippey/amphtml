import {WindowInterface} from '#core/window/interface';

import {docInfo} from '#preact/utils/docInfo';
import {platformUtils} from '#preact/utils/platform';
import {urlUtils} from '#preact/utils/url';
import {xhrUtils} from '#preact/utils/xhr';

import {user} from '#utils/log';

import {openWindowDialog} from '../../../../src/open-window-dialog';

const OPEN_LINK_TIMEOUT = 1500;

/**
 * @return {{openOrInstall: function(): void, promise: Promise<Response>}|null}
 */
export function getAndroidAppInfo() {
  // We want to fallback to browser builtin mechanism when possible.
  const canShowBuiltinBanner =
    platformUtils.isAndroid() && platformUtils.isChrome();

  if (canShowBuiltinBanner) {
    user().info(
      'BENTO-APP-BANNER',
      'Browser supports builtin banners. Not rendering amp-app-banner.'
    );
    return null;
  }

  const manifestLink = self.document.head.querySelector(
    'link[rel=manifest],link[rel=origin-manifest]'
  );

  const missingDataSources = !manifestLink;
  if (missingDataSources) {
    return null;
  }

  const manifestHref = manifestLink.getAttribute('href');

  urlUtils.assertHttpsUrl(manifestHref, undefined, 'manifest href');

  const promise = xhrUtils.fetchJson(manifestHref).then(parseManifest);
  return {
    promise,
    openOrInstall: () => {
      return promise.then((manifest) => {
        if (!manifest) {
          return;
        }
        const {installAppUrl, openInAppUrl} = manifest;
        setTimeout(() => {
          WindowInterface.getTop(window).location.assign(installAppUrl);
        }, OPEN_LINK_TIMEOUT);
        openWindowDialog(window, openInAppUrl, '_top');
      });
    },
  };
}

/**
 * @param {object} manifestJson
 * @return {{installAppUrl: string, openInAppUrl: string}|null}
 */
function parseManifest(manifestJson) {
  const apps = manifestJson['related_applications'];
  if (!apps) {
    user().warn(
      'BENTO-APP-BANNER',
      'related_applications is missing from manifest.json file: %s'
    );
    return null;
  }

  const playApp = apps.find((a) => a['platform'] === 'play');
  if (!playApp) {
    user().warn(
      'BENTO-APP-BANNER',
      'Could not find a platform=play app in manifest: %s'
    );
    return null;
  }

  const installAppUrl = `https://play.google.com/store/apps/details?id=${playApp['id']}`;
  const openInAppUrl = getAndroidIntentForUrl(playApp['id']);
  return {installAppUrl, openInAppUrl};
}

/**
 * @param {string} appId
 * @return {string}
 */
function getAndroidIntentForUrl(appId) {
  const parsedUrl = urlUtils.parse(docInfo.canonicalUrl);
  const cleanProtocol = parsedUrl.protocol.replace(':', '');
  const {host, pathname} = parsedUrl;

  return `android-app://${appId}/${cleanProtocol}/${host}${pathname}`;
}