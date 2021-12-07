import {
  assertHttpsUrl,
  isProtocolValid,
  isProxyOrigin,
  // eslint-disable-next-line local/no-forbidden-terms
  parseUrlWithA,
  // eslint-disable-next-line import/no-restricted-paths
} from '../../url';

class UrlService {
  /**
   * @return {HTMLAnchorElement}
   * @private
   */
  getAnchor_() {
    if (!this.anchor_) {
      this.anchor_ = self.document.createElement('a');
    }
    return this.anchor_;
  }

  /**
   * @param {string} url
   * @return {!Location}
   */
  parse(url) {
    // eslint-disable-next-line local/no-forbidden-terms
    return parseUrlWithA(this.getAnchor_(), url);
  }

  /**
   * @param {string} url
   * @return {boolean}
   */
  isProtocolValid(url) {
    return isProtocolValid(url);
  }

  /**
   * @param {?string|undefined} urlString
   * @param {!Element|string} elementContext Element where the url was found.
   * @param {string=} sourceName Used for error messages.
   * @return {string}
   */
  assertHttpsUrl(urlString, elementContext, sourceName) {
    return assertHttpsUrl(urlString, elementContext, sourceName);
  }

  /**
   * TODO: Should this be deprecated for Bento?
   * @param {string} url
   * @return {boolean}
   */
  isProxyOrigin(url) {
    return isProxyOrigin(url);
  }
}
// eslint-disable-next-line local/no-export-side-effect
export const urlService = new UrlService();
